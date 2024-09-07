defmodule BlackIronWeb.CampaignsHTML do
  @moduledoc """
  HTML view for /play/campaigns
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <%= if !assigns[:ajax] do %>
      <h3>Campaigns list</h3>
    <% end %>
    <bi-campaign-list id="campaign-list" campaigns={Jason.encode!(assigns[:campaigns])}>
      <ajax-it>
        <.simple_form :let={f} as={:entity} for={@changeset} action={~p"/play/campaigns"}>
          <.error :if={@changeset.action == :insert}>
            <%= gettext("Oops, something went wrong! Please check the errors below.") %>
          </.error>

          <input name={f[:pid].name} type="hidden" value={BlackIron.Utils.gen_pid()} />

          <.polymorphic_embed_inputs_for :let={c} field={f[:data]}>
            <.input field={c[:name]} type="text" label={gettext("Name")} required />
            <.input field={c[:description]} type="textarea" label={gettext("Description")} required />
          </.polymorphic_embed_inputs_for>

          <:actions>
            <.button phx-disable-with={gettext("Creating new campaign...")}>
              <%= gettext("Create campaign") %>
            </.button>
          </:actions>
        </.simple_form>
      </ajax-it>
    </bi-campaign-list>
    """
  end

  def show(assigns) do
    ~H"""
    <%= if assigns[:campaign] do %>
    <h3>Campaign <%= assigns[:campaign].data.name %></h3>
    <p><%= assigns[:campaign].data.description %></p>
    <p><a href="pcs"><%= gettext("PCs") %></a></p>
    <% end %>
    <p><a href="/play/campaigns"><%= gettext("Back to campaigns list") %></a></p>
    """
  end
end
