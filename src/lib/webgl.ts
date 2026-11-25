export interface WebGLCapabilities {
  supported: boolean;
  isSoftwareGl: boolean;
  isLowPower: boolean;
}

export function probeWebGLCapabilities(): WebGLCapabilities {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { supported: false, isSoftwareGl: true, isLowPower: true };
  }

  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);

    if (!gl) {
      return { supported: false, isSoftwareGl: true, isLowPower: true };
    }

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const rendererStr = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const isLowPower = cores < 2;

    return {
      supported: true,
      isSoftwareGl,
      isLowPower,
    };
  } catch {
    return { supported: false, isSoftwareGl: true, isLowPower: true };
  }
}
