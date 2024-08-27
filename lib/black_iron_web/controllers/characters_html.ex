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
        <.character_info {assigns} />
        <.character_stats {assigns} />
        <.character_meters {assigns} />
        <.character_special_tracks {assigns} />
        <.character_impacts {assigns} />
        <.character_assets {assigns} />
      </article>
    </bi-character-context>
    """
  end

  defp character_info(assigns) do
    char = assigns[:character] || %{}

    ~H"""
    <section class="info">
      <header>
        <bi-character-portrait href={char[:portrait]} />
        <bi-character-name name={char[:name]} />
      </header>
      <bi-character-initiative initiative={char[:initiative]} />
      <dl>
        <dt>
          <bi-character-alias-label label={char[:alias_label]} />
        </dt>
        <dd><bi-character-alias alias={char[:alias]} /></dd>
        <dt><%= gettext("Pronouns") %></dt>
        <dd>
          <bi-character-pronouns pronouns={char[:pronouns]} />
        </dd>
        <dt><%= gettext("Description") %></dt>
        <dd>
          <bi-character-description description={char[:description]} />
        </dd>
        <dt><%= gettext("Player") %></dt>
        <dd><bi-character-player player={char[:player]} /></dd>
        <dt><%= gettext("Experience") %></dt>
        <dd>
          <bi-character-xp
            tracks={Jason.encode!(char[:special_tracks])}
            added={char[:xp_added]}
            spent={char[:xp_spent]}
          />
        </dd>
      </dl>
    </section>
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
