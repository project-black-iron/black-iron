defmodule BlackIronWeb.CampaignsHTML do
  @moduledoc """
  HTML view for /play/campaigns
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3>Campaigns list</h3>
    <bi-campaign-list campaigns={Jason.encode!(assigns[:campaigns])}></bi-campaign-list>
    <bi-create-campaign>
      <.simple_form :let={f} for={assigns[:conn].params} as={:campaign} action={~p"/play/campaigns/"}>
        <.error :if={assigns[:error_message]}><%= assigns[:error_message] %></.error>

        <.input field={f[:name]} type="text" label="Name" required />
        <.input field={f[:description]} type="textarea" label="Description" required />

        <:actions>
          <.button phx-disable-with="" class="w-full">
            <%= gettext("Create campaign") %>
          </.button>
        </:actions>
      </.simple_form>
    </bi-create-campaign>
    """
  end

  def show(assigns) do
    ~H"""
    <h3>Campaign <%= assigns[:campaignId] %></h3>
    <p>Details about Campaign <%= assigns[:campaignId] %></p>
    <p><a href="/play/campaigns">Back to campaigns list</a></p>
    """
  end
end
