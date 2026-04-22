import api from "./api";

export const getAllTickets = async () => {
  const response = await api.get("/api/tickets");
  return Array.isArray(response.data) ? response.data : [];
};

export const getTicketById = async (id) => {
  const response = await api.get(`/api/tickets/${id}`);
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post("/api/tickets", ticketData);
  return response.data;
};

export const updateTicketStatus = async (id, status) => {
  const response = await api.patch(`/api/tickets/${id}/status`, { status });
  return response.data;
};

export const addComment = async (ticketId, content, authorName) => {
  try {
    const response = await api.post(`/api/tickets/${ticketId}/comments`, {
      commentText: content,
      commenterName: authorName,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const updateComment = async (commentId, commentText, requesterName, requesterRole) => {
  const response = await api.patch(`/api/comments/${commentId}`, {
    commentText,
    requesterName,
    requesterRole,
  });
  return response.data;
};

export const deleteComment = async (
  commentId,
  requesterName,
  requesterRole,
) => {
  await api.delete(`/api/comments/${commentId}`, {
    params: { requesterName, requesterRole },
  });
};

export const createTicketWithImages = async (formData) => {
  const response = await api.post("/api/tickets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteTicket = async (id) => {
  await api.delete(`/api/tickets/${id}`);
};

// export const getTicketPdf = async (id) => {
//     const response = await api.get(`/api/tickets/${id}/pdf`, {
//         responseType: 'blob',
//     });
//     return response.data;
// };

// export const downloadTicketPdf = async (id) => {
//     const pdfBlob = await getTicketPdf(id);
//     const fileURL = window.URL.createObjectURL(pdfBlob);

//     const link = document.createElement('a');
//     link.href = fileURL;
//     link.download = `ticket-${id}.pdf`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     window.URL.revokeObjectURL(fileURL);
// };

// export const previewTicketPdf = async (id) => {
//     const pdfBlob = await getTicketPdf(id);
//     return window.URL.createObjectURL(pdfBlob);
// };

export const getTicketPdf = async (id) => {
  const response = await api.get(`/api/tickets/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};

export const downloadTicketPdf = async (id) => {
  const pdfBlob = await getTicketPdf(id);
  const fileURL = window.URL.createObjectURL(pdfBlob);

  const link = document.createElement("a");
  link.href = fileURL;
  link.download = `ticket-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(fileURL);
};

export const previewTicketPdf = async (id) => {
  const pdfBlob = await getTicketPdf(id);
  return window.URL.createObjectURL(pdfBlob);
};

export const downloadAllTicketsPdf = async () => {
  const response = await api.get("/api/tickets/pdf/all", {
    responseType: "blob",
  });

  const fileURL = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = fileURL;
  link.download = "all-tickets-report.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(fileURL);
};
