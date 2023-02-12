export default interface GetRoutesRequest {
  points: [[number, number], [number, number]];
  transportationModes: string[];
  alternatives: number;
}
