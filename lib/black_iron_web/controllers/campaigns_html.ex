defmodule BlackIronWeb.CampaignsHTML do
  @moduledoc """
  HTML view for /play/campaigns
  """
  use BlackIronWeb, :html

  alias BlackIron.Campaigns.Campaign

  def index(assigns) do
    ~H"""
    <%= if !assigns[:htmx] do %>
      <h3>Campaigns list</h3>
    <% end %>
    <bi-campaign-list
      id="campaign-list"
      hx-swap-oob="true"
      foo="bar"
      campaigns={Jason.encode!(assigns[:campaigns])}
    >
      <.simple_form
        :let={f}
        for={@changeset}
        action={~p"/play/campaigns/"}
        hx-post={~p"/play/campaigns"}
      >
        <.error :if={@changeset.action == :insert}>
          <%= gettext("Oops, something went wrong! Please check the errors below.") %>
        </.error>

        <.input field={f[:name]} type="text" label="Name" required />
        <.input
          field={f[:slug]}
          type="text"
          pattern={Regex.source(Campaign.slug_format())}
          title={Campaign.slug_message()}
          label="Slug"
          required
        />
        <.input field={f[:description]} type="textarea" label="Description" required />

        <:actions>
          <.button phx-disable-with="">
            <%= gettext("Create campaign") %>
          </.button>
        </:actions>
      </.simple_form>
    </bi-campaign-list>
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
