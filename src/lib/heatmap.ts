interface Point {
  lat: number;
  lng: number;
  weight?: number;
}

interface Cluster {
  center: { lat: number; lng: number };
  points: Point[];
  count: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

/**
 * Calculate incident density for heatmap
 * Returns array of points with weights for heatmap visualization
 */
export function calculateIncidentDensity(
  points: Point[],
  gridSize: number = 0.001 // ~100 meters
): Array<{ lat: number; lng: number; weight: number }> {
  if (points.length === 0) return [];

  // Group points into grid cells
  const grid = new Map<string, { lat: number; lng: number; weight: number }>();

  points.forEach(point => {
    // Round to grid cell
    const cellLat = Math.floor(point.lat / gridSize) * gridSize;
    const cellLng = Math.floor(point.lng / gridSize) * gridSize;
    const cellKey = `${cellLat},${cellLng}`;

    if (!grid.has(cellKey)) {
      grid.set(cellKey, {
        lat: cellLat + gridSize / 2,
        lng: cellLng + gridSize / 2,
        weight: 0
      });
    }

    const cell = grid.get(cellKey)!;
    cell.weight += point.weight || 1;
  });

  return Array.from(grid.values());
}

/**
 * Cluster nearby points together
 * Returns array of clusters
 */
export function clusterIncidents(
  points: Point[],
  clusterRadius: number = 100 // meters
): Cluster[] {
  if (points.length === 0) return [];

  const clusters: Cluster[] = [];
  const used = new Set<number>();

  points.forEach((point, index) => {
    if (used.has(index)) return;

    const cluster: Cluster = {
      center: { lat: point.lat, lng: point.lng },
      points: [point],
      count: point.weight || 1
    };

    used.add(index);

    // Find nearby points
    points.forEach((otherPoint, otherIndex) => {
      if (used.has(otherIndex)) return;

      const distance = calculateDistance(
        point.lat,
        point.lng,
        otherPoint.lat,
        otherPoint.lng
      );

      if (distance <= clusterRadius) {
        cluster.points.push(otherPoint);
        cluster.count += otherPoint.weight || 1;
        used.add(otherIndex);

        // Update cluster center (average of points)
        const totalLat = cluster.points.reduce((sum, p) => sum + p.lat, 0);
        const totalLng = cluster.points.reduce((sum, p) => sum + p.lng, 0);
        cluster.center = {
          lat: totalLat / cluster.points.length,
          lng: totalLng / cluster.points.length
        };
      }
    });

    clusters.push(cluster);
  });

  return clusters;
}

/**
 * Generate heatmap data points from incidents
 */
export function generateHeatmapData(incidents: Array<{
  lat: number;
  lng: number;
  priority?: string;
}>): Array<{ lat: number; lng: number; weight: number }> {
  // Weight incidents by priority
  const priorityWeights: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const points: Point[] = incidents.map(incident => ({
    lat: incident.lat,
    lng: incident.lng,
    weight: priorityWeights[incident.priority || 'medium'] || 1
  }));

  return calculateIncidentDensity(points);
}

