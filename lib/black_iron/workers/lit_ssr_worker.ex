defmodule BlackIron.LitSSRWorker do
  @moduledoc """
  Manages a child Node.js process that does server-side rendering for HTML
  strings with lit components in them.
  """
  use GenServer
  require Logger

  @ssr_module Path.expand("../../../priv/ssr/lit-ssr.js", __DIR__)
  @command "node #{@ssr_module}"
  @timeout 5000

  def prerender_html(html) do
    :poolboy.transaction(
      :lit_ssr_worker,
      fn pid ->
        GenServer.call(pid, {:render, html})
      end,
      @timeout
    )
  end
  
  def start_link(args \\ [], opts \\ []) do
    GenServer.start_link(__MODULE__, args, opts)
  end

  def init(_args \\ []) do
    state = spawn_child()
    {:ok, pid} = FileSystem.start_link(dirs: [Path.dirname(@ssr_module)])
    FileSystem.subscribe(pid)

    {:ok, Map.put(state, :watcher_pid, pid)}
  end
  
  defp spawn_child do
    port = Port.open({:spawn, @command}, [:binary, :exit_status])
    ref = Port.monitor(port)
    %{exit_status: nil, buffer: LineBuffer.new(), port: port, ref: ref}
  end

  def handle_call({:render, html}, from, %{port: port} = state) do
    Port.command(port, "#{encode_pid(from)}\t#{Jason.encode!(html)}\n")
    {:noreply, state}
  end
  
  def handle_info({port, {:data, line}}, %{buffer: buffer} = state) do
    {updated_state, lines} = LineBuffer.add_data(buffer, line)

    lines
    |> Enum.each(fn line ->
      case String.split(line, "\t", parts: 3) do
        ["error", pid_str, msg] ->
          Logger.error("Lit SSR error: #{msg}")
          GenServer.reply(decode_pid(pid_str), {:error, msg})

        ["error", msg] ->
          Logger.error("Lit SSR error: #{msg}")

        ["rendered", pid_str, result] ->
          GenServer.reply(decode_pid(pid_str), {:ok, Jason.decode!(result)})

        x ->
          Logger.error("oops, got #{inspect(x)}")
      end
    end)

    {:noreply, %{state | buffer: updated_state, port: port}}
  end

  def handle_info({port, {:exit_status, status}}, state) do
    Logger.error("Lit SSR process #{encode_pid(self())} exited with status #{status}")

    {:stop, if(status == 0, do: :normal, else: :error), %{state | port: port}}
  end

  def handle_info({:DOWN, _ref, :port, port, :normal}, state) do
    Logger.info("Handled :DOWN message from port: #{inspect(port)}")

    {:stop, :port_down, %{state | port: port}}
  end

  def handle_info({:file_event, watcher_pid, {_path, events}}, %{watcher_pid: watcher_pid, port: port, ref: ref} = state) do
    if :modified in events do
      Logger.info("reinitializing ssr worker #{self() |> :erlang.pid_to_list() |> to_string()} after module modification")
      Port.demonitor(ref)
      Port.close(port)
      {:noreply, Map.put(spawn_child(), :watcher_pid, watcher_pid)}
    else
      {:noreply, state}
    end
  end

  def handle_info({:file_event, watcher_pid, :stop}, %{watcher_pid: watcher_pid} = state) do
    # Your own logic when monitor stop
    {:noreply, state}
  end
  
  defp encode_pid(pid) do
    pid
    |> :erlang.term_to_binary()
    |> Base.url_encode64()
  end

  defp decode_pid(pid_str) do
    pid_str
    |> Base.url_decode64!()
    |> :erlang.binary_to_term()
  end
end
