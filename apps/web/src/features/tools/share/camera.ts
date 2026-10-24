export function cameraErrorMessage(reason: unknown) {
  if (reason instanceof DOMException) {
    if (reason.name === "NotAllowedError" || reason.name === "PermissionDeniedError") {
      return "Allow the camera for this site, then try the scan again.";
    }
    if (reason.name === "NotFoundError" || reason.name === "DevicesNotFoundError") {
      return "No camera was found on this device.";
    }
    if (reason.name === "NotReadableError" || reason.name === "TrackStartError") {
      return "The camera is already in use by another app.";
    }
    if (reason.name === "SecurityError") {
      return "Open this page on localhost or https before using the camera.";
    }
  }
  return reason instanceof Error ? reason.message : "Could not open the camera.";
}
