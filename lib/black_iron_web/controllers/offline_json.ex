defmodule BlackIronWeb.OfflineJSON do
  @moduledoc """
  JSON responses for listing offline pages.
  """
  def index(%{paths: paths}) do
    %{paths: paths}
  end
end
