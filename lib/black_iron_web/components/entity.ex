defmodule BlackIronWeb.Components.Entity do
  @moduledoc """
  Entity-related server-side components.
  """
  use Phoenix.Component
  
  use Phoenix.VerifiedRoutes,
    router: BlackIronWeb.Router,
    endpoint: BlackIronWeb.Endpoint,
    statics: ~w(images)

  import BlackIronWeb.CoreComponents
  # import BlackIronWeb.Gettext
  
  @doc """
  Renders a form that can synchronize with a context entity.
  """
  attr :context, :string, required: true, doc: "the name of the entity context to sync"
  attr :for, :any, required: true, doc: "the data structure for the form"
  attr :as, :any, default: nil, doc: "the server side parameter to collect all input under"

  attr :live, :boolean,
    default: false,
    doc: "whether to invoke entity updates on change events vs only on submit"

  attr :rest, :global,
    include: ~w(autocomplete name rel action hx-post enctype method novalidate target multipart),
    doc: "the arbitrary HTML attributes to apply to the form tag"

  slot :inner_block, required: true
  slot :actions, doc: "the slot for form actions, such as a submit button"
  slot :form_error, doc: "the error template for the whole form"

  def entity_form(assigns) do
    ~H"""
    <bi-entity-form live={@live} context={@context}>
      <template slot="form-error">
        <%= render_slot(@form_error) %>
      </template>
      <.simple_form :let={f} for={@for} as={@as} {@rest}>
        <div class="entity-form-error">
          <%= if @for.action == :insert || @for.action == :update do %>
            <%= render_slot(@form_error) %>
          <% end %>
        </div>
        <%= render_slot(@inner_block, f) %>
        <:actions>
          <%= render_slot(@actions) %>
        </:actions>
      </.simple_form>
    </bi-entity-form>
    """
  end
end