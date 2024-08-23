defmodule BlackIron.LitSSRWorker do
  @moduledoc """
  Manages a child Node.js process that does server-side rendering for HTML
  strings with lit components in them.
  """
  use GenServer
  require Logger

  @command "node #{Path.expand("../../../priv/lit-ssr.js", __DIR__)}"
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
    port = Port.open({:spawn, @command}, [:binary, :exit_status])
    Port.monitor(port)

    {:ok, %{exit_status: nil, buffer: LineBuffer.new(), port: port}}
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
