// Mock for web-vitals library v4 (updated API)
export const onCLS = jest.fn((callback: (metric: any) => void) => {
  callback({
    name: 'CLS',
    value: 0.05,
    rating: 'good',
    delta: 0.05,
    id: 'v1-1642074205382-7175040259815',
    entries: []
  });
});

export const onINP = jest.fn((callback: (metric: any) => void) => {
  callback({
    name: 'INP',
    value: 150,
    rating: 'good',
    delta: 150,
    id: 'v1-1642074205382-7175040259816',
    entries: []
  });
});

export const onFCP = jest.fn((callback: (metric: any) => void) => {
  callback({
    name: 'FCP',
    value: 1200,
    rating: 'good',
    delta: 1200,
    id: 'v1-1642074205382-7175040259817',
    entries: []
  });
});

export const onLCP = jest.fn((callback: (metric: any) => void) => {
  callback({
    name: 'LCP',
    value: 1800,
    rating: 'good',
    delta: 1800,
    id: 'v1-1642074205382-7175040259818',
    entries: []
  });
});

export const onTTFB = jest.fn((callback: (metric: any) => void) => {
  callback({
    name: 'TTFB',
    value: 600,
    rating: 'good',
    delta: 600,
    id: 'v1-1642074205382-7175040259819',
    entries: []
  });
}); 