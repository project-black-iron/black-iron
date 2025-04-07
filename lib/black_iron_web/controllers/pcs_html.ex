defmodule BlackIronWeb.PCsHTML do
  @moduledoc """
  """
  use BlackIronWeb, :html
  
  alias BlackIronWeb.Components.Entity

  def index(assigns) do
    ~H"""
    <h3><%= gettext("Player character list") %></h3>
    <bi-campaign-context campaign={Jason.encode!(assigns[:campaign])}>
      <bi-pc-list pcs={Jason.encode!(assigns[:pcs])} />
      <details>
        <summary><%= gettext("Create a new character") %></summary>
        <.pc_character_sheet {assigns} />
      </details>
    </bi-campaign-context>
    """
  end

  def show(assigns) do
    ~H"""
    <.pc_character_sheet {assigns} />
    """
  end

  defp pc_character_sheet(assigns) do
    ~H"""
    <bi-campaign-context campaign={Jason.encode!(assigns[:campaign])}>
      <bi-pc-context pc={Jason.encode!(assigns[:pc])}>
        <article>
          <header><%= gettext("Character Sheet") %></header>
          <Entity.entity_form
            :let={cs}
            context="pc"
            for={@changeset}
            autocomplete="off"
            live
            action={
              if assigns[:pc] do
                ~p"/play/campaigns/#{assigns[:campaign_pid]}/#{assigns[:cslug]}/pcs/#{assigns[:pc_pid]}/#{assigns[:pc_slug]}"
              else
                ~p"/play/campaigns/#{assigns[:campaign_pid]}/#{assigns[:cslug]}/pcs"
              end
            }
          >
            <:form_error>
              <.error>
                <%= gettext("Oops, something went wrong! Please check the errors below.") %>
              </.error>
            </:form_error>
            <.pc_form_fields cs={cs} {assigns} />
          </Entity.entity_form>
        </article>
      </bi-pc-context>
    </bi-campaign-context>
    """
  end
  
  defp pc_form_fields(assigns) do
    ~H"""
    <.input type="hidden" field={@cs[:pid]} />
    <.pc_info cs={@cs} {assigns} />
    <.pc_stats {assigns} />
    <.pc_meters {assigns} />
    <.pc_special_tracks {assigns} />
    <.pc_impacts {assigns} />
    <.pc_assets {assigns} />
    """
  end

  defp pc_info(assigns) do
    ~H"""
    <fieldset class="info">
      <.polymorphic_embed_inputs_for :let={data} field={@cs[:data]}>
        <.input type="hidden" field={data[:campaign_pid]} />
        <img src={@pc && @pc.data.portrait} width="100" />
        <.input field={data[:name]} />
        <!--
        TODO(@zkat): configure these based on the current campaign's playset rules,
        and bi-initiative-select can handle the dynamic/offline switching between
        different rules.
        -->
        <bi-initiative-select>
          <.input
            type="select"
            label={gettext("Initiative")}
            field={data[:initiative]}
            options={[
              {gettext("Out of combat"), "out-of-combat"},
              {gettext("Has initiative"), "has-initiative"},
              {gettext("No initiative"), "no-initiative"}
            ]}
          />
        </bi-initiative-select>
        <.input label={gettext("Alias")} field={data[:alias]} />
        <.input label={gettext("Pronouns")} field={data[:pronouns]} />
        <.input label={gettext("Description")} type="textarea" field={data[:description]} />
        <.input label={gettext("Player")} field={data[:player]} />
        <.input label={gettext("XP Added")} field={data[:xp_added]} />
        <.input label={gettext("XP Spent")} field={data[:xp_spent]} />
      </.polymorphic_embed_inputs_for>
    </fieldset>
    """
  end

  defp pc_stats(assigns) do
    ~H"""
    <section class="stats"></section>
    """
  end

  defp pc_meters(assigns) do
    ~H"""
    <section class="meters"></section>
    """
  end

  defp pc_special_tracks(assigns) do
    ~H"""
    <section class="special-tracks"></section>
    """
  end

  defp pc_impacts(assigns) do
    ~H"""
    <section class="impacts"></section>
    """
  end

  defp pc_assets(assigns) do
    ~H"""
    <section class="assets"></section>
    """
  end
end
