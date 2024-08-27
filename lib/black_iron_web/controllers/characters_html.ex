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
    campaign = assigns[:campaign] || %{}

    ~H"""
    <section class="info">
      <header>
        <bi-character-portrait src={char[:portrait]} />
        <bi-character-text-field text={char[:name]} field="name" />
      </header>
      <bi-character-initiative initiative={char[:initiative]} />
      <dl>
        <dt>
          <bi-campaign-text-field text={campaign[:alias_label]} field="alias_label" />
        </dt>
        <dd><bi-character-text-field text={char[:alias]} field="alias" /></dd>
        <dt><%= gettext("Pronouns") %></dt>
        <dd>
          <bi-character-text-field text={char[:pronouns]} field="pronouns" />
        </dd>
        <dt><%= gettext("Description") %></dt>
        <dd>
          <bi-character-text-field text={char[:description]} field="description" />
        </dd>
        <dt><%= gettext("Player") %></dt>
        <dd><bi-character-text-field text={char[:player]} field="player" /></dd>
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
