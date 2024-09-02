defmodule BlackIronWeb.CampaignsHTML do
  @moduledoc """
  HTML view for /play/campaigns
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <%= if !assigns[:htmx] do %>
      <h3>Campaigns list</h3>
    <% end %>
    <bi-campaign-list
      id="campaign-list"
      hx-swap-oob="true"
      campaigns={Jason.encode!(assigns[:campaigns])}
    >
      <.simple_form
        :let={f}
        as={:entity}
        for={@changeset}
        action={~p"/play/campaigns/"}
        hx-post={~p"/play/campaigns"}
      >
        <.error :if={@changeset.action == :insert}>
          <%= gettext("Oops, something went wrong! Please check the errors below.") %>
        </.error>

        <.input field={f[:pid]} type="hidden" value={BlackIron.Utils.gen_pid()} />

        <.polymorphic_embed_inputs_for :let={c} field={f[:data]}>
          <.input field={c[:name]} type="text" label="Name" required />
          <.input field={c[:description]} type="textarea" label="Description" required />
        </.polymorphic_embed_inputs_for>

        <:actions>
          <.button phx-disable-with="Creating new campaign...">
            <%= gettext("Create campaign") %>
          </.button>
        </:actions>
      </.simple_form>
    </bi-campaign-list>
    """
  end

  def show(assigns) do
    ~H"""
    <h3>Campaign <%= assigns[:campaign_pid] %></h3>
    <p>Details about Campaign <%= assigns[:campaign_pid] %></p>
    <p><a href="/play/campaigns">Back to campaigns list</a></p>
    """
  end
end
