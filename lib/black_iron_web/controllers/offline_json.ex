defmodule BlackIronWeb.OfflineJSON do
  @moduledoc """
  JSON responses for listing offline pages.
  """
  def app_paths(%{paths: paths}) do
    %{paths: paths}
  end

  def static_paths(%{paths: paths}) do
    %{paths: paths}
  end
end
