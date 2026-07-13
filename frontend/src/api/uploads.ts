const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/uploads/imagen`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.detail ?? `Error ${response.status}`;
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message),
    );
  }

  const data = await response.json();
  data.url = `${API_BASE_URL}${data.url}`;
  return data;
}
