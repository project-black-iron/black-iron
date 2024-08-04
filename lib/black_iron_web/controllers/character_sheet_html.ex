defmodule BlackIronWeb.CharacterSheetHTML do
  @moduledoc """
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <bi-character-sheet>
      <article slot="placeholder">
        <header><%= gettext("Character Sheet") %></header>
        <p><%= gettext("Select a character to view their sheet.") %></p>
        <bi-character-picker />
      </article>
      <article slot="sheet">
        <header><%= gettext("Character Sheet") %></header>
        <.character_info />
        <.character_stats />
        <.character_meters />
        <.character_special_tracks />
        <.character_impacts />
        <.character_assets />
      </article>
    </bi-character-sheet>
    """
  end

  defp character_info(assigns) do
    ~H"""
    <section class="info">
      <header>
        <bi-character-portrait />
        <bi-character-name />
      </header>
      <bi-character-initiative />
      <dl>
        <dt><bi-character-alias-label /></dt>
        <dd><bi-character-alias /></dd>
        <dt><%= gettext("Pronouns") %></dt>
        <dd><bi-character-pronouns /></dd>
        <dt><%= gettext("Description") %></dt>
        <dd><bi-character-description /></dd>
        <dt><%= gettext("Player") %></dt>
        <dd><bi-character-player /></dd>
        <dt><%= gettext("Experience") %></dt>
        <dd><bi-character-xp /></dd>
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
