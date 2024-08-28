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
    ~H"""
    <fieldset class="info">
      <bi-sync-field context="character" field="portrait" attr="src">
        <!-- TODO: File upload input -->
        <img src={@char[:portrait]}>
      </bi-sync-field>
      <bi-sync-field context="character" field="name">
        <.input field={@char[:name]} />
      </bi-sync-field>
      <bi-sync-field context="character" field="initiative">
        <.input type="select" field={@char[:initiative]} options={@campaign[:initiative_options]} />
      </bi-sync-field>
      <dl>
        <dt>
          <bi-sync-field context="campaign" field="alias_label" prop="textContent">
            <span><%= @campaign[:alias_label] %></span>
          </bi-sync-field>
        </dt>
        <dd>
          <bi-sync-field context="character" field="alias">
            <.input field={@char[:alias]} />
          </bi-sync-field>
        </dd>
        <dt><%= gettext("Pronouns") %></dt>
        <dd>
          <bi-sync-field context="character" field="pronouns">
            <.input field={@char[:pronouns]} />
          </bi-sync-field>
        </dd>
        <dt><%= gettext("Description") %></dt>
        <dd>
          <bi-sync-field context="character" field="description">
            <.input type="textarea" field={@char[:description]} />
          </bi-sync-field>
        </dd>
        <dt><%= gettext("Player") %></dt>
        <dd>
          <bi-sync-field context="character" field="player">
            <.input field={@char[:player]} />
          </bi-sync-field>
        </dd>
        <dt><%= gettext("Experience") %></dt>
        <dd>
          <!-- TODO(@zkat): Can we make this more generic?... -->
          <bi-character-xp
            tracks={Jason.encode!(@char[:special_tracks])}
            added={@char[:xp_added]}
            spent={@char[:xp_spent]}
          />
        </dd>
      </dl>
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
