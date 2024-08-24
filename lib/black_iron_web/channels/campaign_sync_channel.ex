defmodule BlackIronWeb.CampaignSyncChannel do
  @moduledoc """
  Syncs campaign data.
  """
  use BlackIronWeb, :channel

  @impl true
  def join("campaign_sync:" <> username, _payload, socket) do
    if socket.assigns[:user].username == username do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (campaign_sync:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end
end
