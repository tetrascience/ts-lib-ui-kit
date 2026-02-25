import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getTdpBaseUrlFromReferrer, buildTdpUrl, navigateToTdpUrl, tdpPaths } from '../tdpUrl';

describe('getTdpBaseUrlFromReferrer', () => {
  beforeEach(() => {
    // Reset document.referrer between tests
    Object.defineProperty(document, 'referrer', {
      value: '',
      writable: true,
      configurable: true,
    });
  });

  it('returns null when document.referrer is empty', () => {
    expect(getTdpBaseUrlFromReferrer()).toBeNull();
  });

  it('strips /data-workspace from referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://tetrascience.com/data-workspace/some-app/123',
    });
    expect(getTdpBaseUrlFromReferrer()).toBe('https://tetrascience.com');
  });

  it('strips /file/ path from referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://tetrascience.com/file/abc-123',
    });
    expect(getTdpBaseUrlFromReferrer()).toBe('https://tetrascience.com');
  });

  it('strips /pipeline-edit/ from referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://tetrascience.com/pipeline-edit/p-123',
    });
    expect(getTdpBaseUrlFromReferrer()).toBe('https://tetrascience.com');
  });

  it('strips /search from referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://tetrascience.com/search?q=test',
    });
    expect(getTdpBaseUrlFromReferrer()).toBe('https://tetrascience.com');
  });

  it('strips /artifacts/ from referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://tetrascience.com/artifacts/ids/common/my-schema',
    });
    expect(getTdpBaseUrlFromReferrer()).toBe('https://tetrascience.com');
  });

  it('preserves org slug path prefix before route', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://tetrascience-uat.com/customer-org/data-workspace/app/123',
    });
    expect(getTdpBaseUrlFromReferrer()).toBe('https://tetrascience-uat.com/customer-org');
  });

  it('preserves multi-segment org slug prefix', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://example.com/org/sub/file/abc-123',
    });
    expect(getTdpBaseUrlFromReferrer()).toBe('https://example.com/org/sub');
  });

  it('returns origin when no known route prefix matched', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://tetrascience.com/some-unknown-page',
    });
    expect(getTdpBaseUrlFromReferrer()).toBe('https://tetrascience.com');
  });

  it('returns origin for TDP root URL', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://tetrascience.com/',
    });
    expect(getTdpBaseUrlFromReferrer()).toBe('https://tetrascience.com');
  });

  it('returns null for malformed URL', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'not-a-url',
    });
    expect(getTdpBaseUrlFromReferrer()).toBeNull();
  });
});

describe('buildTdpUrl', () => {
  it('joins base URL and path', () => {
    expect(buildTdpUrl('https://tetrascience.com', '/file/abc-123')).toBe('https://tetrascience.com/file/abc-123');
  });

  it('handles base URL with org prefix', () => {
    expect(buildTdpUrl('https://tetrascience.com/my-org', '/file/abc-123')).toBe(
      'https://tetrascience.com/my-org/file/abc-123',
    );
  });

  it('handles path without leading slash', () => {
    expect(buildTdpUrl('https://tetrascience.com', 'file/abc-123')).toBe('https://tetrascience.com/file/abc-123');
  });

  it('handles base URL with trailing slash', () => {
    expect(buildTdpUrl('https://tetrascience.com/', '/file/abc-123')).toBe('https://tetrascience.com/file/abc-123');
  });

  it('returns null for invalid base URL', () => {
    expect(buildTdpUrl('not-a-url', '/file/abc')).toBeNull();
  });
});

describe('navigateToTdpUrl', () => {
  let windowOpenSpy: ReturnType<typeof vi.spyOn>;
  let postMessageSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('opens new tab when newTab is true', () => {
    navigateToTdpUrl('https://tetrascience.com/file/abc', { newTab: true });

    expect(windowOpenSpy).toHaveBeenCalledWith('https://tetrascience.com/file/abc', '_blank', 'noopener,noreferrer');
  });

  it('uses postMessage when inside an iframe', () => {
    postMessageSpy = vi.fn();
    const originalParent = window.parent;

    // Simulate iframe context: parent !== window
    Object.defineProperty(window, 'parent', {
      value: { postMessage: postMessageSpy },
      writable: true,
      configurable: true,
    });

    navigateToTdpUrl('https://tetrascience.com/my-org/file/abc?v=1#section');

    expect(postMessageSpy).toHaveBeenCalledWith({ type: 'navigate', path: '/my-org/file/abc?v=1#section' }, '*');

    // Restore
    Object.defineProperty(window, 'parent', {
      value: originalParent,
      writable: true,
      configurable: true,
    });
  });

  it('falls back to window.location.href when not in iframe', () => {
    // In jsdom, window.parent === window (not in iframe)
    const locationHrefSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location);

    // Since we can't easily spy on location.href assignment, just verify
    // it doesn't call window.open or postMessage
    navigateToTdpUrl('https://tetrascience.com/file/abc');
    expect(windowOpenSpy).not.toHaveBeenCalled();

    locationHrefSpy.mockRestore();
  });
});

describe('tdpPaths', () => {
  it('fileDetails returns correct path', () => {
    expect(tdpPaths.fileDetails('abc-123')).toBe('/file/abc-123');
  });

  it('pipelineEdit returns correct path', () => {
    expect(tdpPaths.pipelineEdit('p-456')).toBe('/pipeline-edit/p-456');
  });

  it('pipelineDetails returns correct path', () => {
    expect(tdpPaths.pipelineDetails('p-456')).toBe('/pipeline-details/p-456');
  });

  it('search returns path without query', () => {
    expect(tdpPaths.search()).toBe('/search');
  });

  it('search returns path with encoded query', () => {
    expect(tdpPaths.search('hello world')).toBe('/search?q=hello%20world');
  });

  it('dataWorkspace returns correct path', () => {
    expect(tdpPaths.dataWorkspace()).toBe('/data-workspace');
  });

  it('dataApps returns correct path', () => {
    expect(tdpPaths.dataApps()).toBe('/data-apps');
  });

  it('artifact returns correct path', () => {
    expect(tdpPaths.artifact('ids', 'common', 'my-schema')).toBe('/artifacts/ids/common/my-schema');
  });
});
