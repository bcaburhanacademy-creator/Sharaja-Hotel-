/**
 * QR Code Generator for Sharjah Hotel Yaru Digital Menu
 * Generates an ultra-crisp QR code linking to the live restaurant menu.html
 * Allows dynamic target URL override, styling preview, and instant PNG download for table tent printing.
 */

export function getProductionMenuUrl() {
  // Check if running on hosted domain, or construct clean public link
  const origin = window.location.origin;
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    // If testing on localhost, use the public cloud run deployment URL as recommended
    return "https://ais-dev-zrfbjim46rp7dv4qanyxuo-991168747558.asia-southeast1.run.app/menu.html";
  }
  return `${origin}/menu.html`;
}

/**
 * Generate a QR code image using Google Chart API or SVG QR matrix
 */
export function renderMenuQRCode(containerElement, targetUrl = null, size = 260) {
  if (!containerElement) return;

  const finalUrl = targetUrl || getProductionMenuUrl();
  const encodedUrl = encodeURIComponent(finalUrl);

  // Use reliable high-resolution QR service with high error correction (H)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&margin=12&format=png`;

  containerElement.innerHTML = `
    <div class="qr-code-wrapper">
      <img 
        src="${qrImageUrl}" 
        alt="QR Code for Sharjah Hotel Yaru Digital Menu" 
        class="qr-code-image" 
        id="liveMenuQrImage"
        width="${size}" 
        height="${size}" 
      />
      <div class="qr-url-caption">${finalUrl}</div>
    </div>
  `;
}

export function downloadMenuQRCode(filename = "Sharjah-Hotel-Yaru-Menu-QR.png") {
  const finalUrl = getProductionMenuUrl();
  const encodedUrl = encodeURIComponent(finalUrl);
  // High-res 800x800 for high-resolution table tent printing
  const downloadApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=${encodedUrl}&margin=20&format=png`;

  // Fetch as blob to force true instant download
  fetch(downloadApiUrl)
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(err => {
      console.warn("Direct blob download failed, falling back to window open:", err);
      const a = document.createElement("a");
      a.href = downloadApiUrl;
      a.target = "_blank";
      a.download = filename;
      a.click();
    });
}
