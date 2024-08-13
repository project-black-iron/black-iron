defmodule BlackIronWeb.CharactersHTML do
  @moduledoc """
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3>Characters list</h3>
    <ul class="character-list">
      <!-- Campaigns go here -->
      <li><a href="/play/campaigns/1/characters/1">Character 1</a></li>
    </ul>
    """
  end

  def show(assigns) do
    ~H"""
    <bi-character-context character-data={Jason.encode!(assigns[:character])}>
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
    ~H"""
    <section class="info">
      <header>
        <bi-character-portrait href={assigns[:character] && assigns[:character][:portrait]} />
        <bi-character-name name={assigns[:character] && assigns[:character][:name]} />
      </header>
      <bi-character-initiative initiative={assigns[:character] && assigns[:character][:initiative]} />
      <dl>
        <dt>
          <bi-character-alias-label label={assigns[:campaign] && assigns[:campaign][:alias_label]} />
        </dt>
        <dd><bi-character-alias alias={assigns[:character] && assigns[:character][:alias]} /></dd>
        <dt><%= gettext("Pronouns") %></dt>
        <dd>
          <bi-character-pronouns pronouns={assigns[:character] && assigns[:character][:pronouns]} />
        </dd>
        <dt><%= gettext("Description") %></dt>
        <dd>
          <bi-character-description description={
            assigns[:character] && assigns[:character][:description]
          } />
        </dd>
        <dt><%= gettext("Player") %></dt>
        <dd><bi-character-player player={assigns[:character] && assigns[:character][:player]} /></dd>
        <dt><%= gettext("Experience") %></dt>
        <dd>
          <bi-character-xp
            added={assigns[:character] && assigns[:character][:xp_added]}
            spent={assigns[:character] && assigns[:character][:xp_spent]}
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
