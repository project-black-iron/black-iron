defmodule BlackIron.Utils do
  @moduledoc """
  Utility functions for the Black Iron application.
  """

  @doc """
  Generates a new pid for an entity.
  """
  def gen_pid do
    random_string(8)
  end

  defp random_string(length) do
    :crypto.strong_rand_bytes(length) |> Base.url_encode64() |> binary_part(0, length)
  end
end
