/** Lien WhatsApp (wa.me) vers un numéro international sans « + », avec un message pré-rempli. */
export function whatsappLink(message: string, phone?: string): string {
  return `https://wa.me/${phone ?? ''}?text=${encodeURIComponent(message)}`;
}
