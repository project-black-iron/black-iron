defmodule BlackIronWeb.PCsHTML do
  @moduledoc """
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3><%= gettext("Player character list") %></h3>
    <bi-pc-list pcs={Jason.encode!(assigns[:pcs])} />
    """
  end

  def show(assigns) do
    ~H"""
    <bi-pc-context pc={Jason.encode!(assigns[:pc])}>
      <article>
        <header><%= gettext("Character Sheet") %></header>
        <bi-synced-form>
          <.form for={@form}>
            <.pc_info {assigns} />
            <.pc_stats {assigns} />
            <.pc_meters {assigns} />
            <.pc_special_tracks {assigns} />
            <.pc_impacts {assigns} />
            <.pc_assets {assigns} />
          </.form>
        </bi-synced-form>
      </article>
    </bi-pc-context>
    """
  end

  defp pc_info(assigns) do
    ~H"""
    <fieldset class="info">
      <.polymorphic_embed_inputs_for :let={data} field={@form[:data]}>
        <img src={@pc["data"]["portrait"]} width="100" />
        <.input field={data[:name]} />
        <.input type="select" field={data[:initiative]} options={[]} />
        <span><%= gettext("Alias") %></span>
        <.input field={data[:alias]} />
        <.input label={gettext("Pronouns")} field={data[:pronouns]} />
        <.input label={gettext("Description")} type="textarea" field={data[:description]} />
        <.input label={gettext("Player")} field={data[:player]} />
        <span><%= gettext("Experience") %></span>
        <bi-pc-xp
          tracks={Jason.encode!(@pc["data"]["special_tracks"])}
          added={@pc["data"]["xp_added"]}
          spent={@pc["data"]["xp_spent"]}
        />
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
