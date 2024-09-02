defmodule BlackIronWeb.CharactersHTML do
  @moduledoc """
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3>Characters list</h3>
    <ul class="character-list">
      <!-- Campaigns go here -->
      <li><a href="1/slug">Character 1</a></li>
    </ul>
    """
  end

  def show(assigns) do
    ~H"""
    <bi-character-context character={Jason.encode!(assigns[:character])}>
      <article>
        <header><%= gettext("Character Sheet") %></header>
        <.form for={@form}>
          <.character_info {assigns} />
          <.character_stats {assigns} />
          <.character_meters {assigns} />
          <.character_special_tracks {assigns} />
          <.character_impacts {assigns} />
          <.character_assets {assigns} />
        </.form>
      </article>
    </bi-character-context>
    """
  end

  defp character_info(assigns) do
    ~H"""
    <fieldset class="info">
      <bi-sync-field context="character" field="portrait" attr="src">
        <img src={@character[:portrait]} width="100" />
      </bi-sync-field>
      <bi-sync-field context="character" field="name">
        <.input field={@form[:name]} />
      </bi-sync-field>
      <bi-sync-field context="character" field="initiative">
        <.input type="select" field={@form[:initiative]} options={[]} />
      </bi-sync-field>
      <bi-sync-field context="campaign" field="alias_label" prop="textContent">
        <span><%= gettext("Alias") %></span>
      </bi-sync-field>
      <bi-sync-field context="character" field="alias">
        <.input field={@form[:alias]} />
      </bi-sync-field>
      <bi-sync-field context="character" field="pronouns">
        <.input label={gettext("Pronouns")} field={@form[:pronouns]} />
      </bi-sync-field>
      <bi-sync-field context="character" field="description">
        <.input label={gettext("Description")} type="textarea" field={@form[:description]} />
      </bi-sync-field>
      <bi-sync-field context="character" field="player">
        <.input label={gettext("Player")} field={@form[:player]} />
      </bi-sync-field>
      <span><%= gettext("Experience") %></span>
      <bi-character-xp
        tracks={Jason.encode!(@character[:special_tracks])}
        added={@character[:xp_added]}
        spent={@character[:xp_spent]}
      />
    </fieldset>
    """
  end

  defp character_stats(assigns) do
    ~H"""
    <section class="stats"></section>
    """
  end

  defp character_meters(assigns) do
    ~H"""
    <section class="meters"></section>
    """
  end

  defp character_special_tracks(assigns) do
    ~H"""
    <section class="special-tracks"></section>
    """
  end

  defp character_impacts(assigns) do
    ~H"""
    <section class="impacts"></section>
    """
  end

  defp character_assets(assigns) do
    ~H"""
    <section class="assets"></section>
    """
  end
end
