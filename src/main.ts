import './style.css';

import Alpine from 'alpinejs';
import { upperFirst } from 'lodash';
import { minutesToMilliseconds } from 'date-fns';
import humanizeDuration from 'humanize-duration';
import leaflet from 'leaflet';

import treqster from './treqster';
import GetRoutesRequest from './types/GetRoutesRequest';
import Route from './types/Route';

const leafletsLayer = {
  path: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  options: {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  },
};

Alpine.data('app', function () {
  return {
    init() {
      // Origin
      this.originMap = leaflet.map(this.$refs.origin, {
        center: this.points[0],
        zoom: 13,
      });
      leaflet.tileLayer(leafletsLayer.path, leafletsLayer.options).addTo(this.originMap);
      this.addOriginMarket();
      this.originMap.on('click', (event: any) => {
        this.points[0][0] = event.latlng.lat;
        this.points[0][1] = event.latlng.lng;
        this.addOriginMarket();
      });

      // Dest
      this.destMap = leaflet.map(this.$refs.dest, {
        center: this.points[1],
        zoom: 13,
      });
      leaflet.tileLayer(leafletsLayer.path, leafletsLayer.options).addTo(this.destMap);
      this.addDestMarket();
      this.destMap.on('click', (event: any) => {
        this.points[1][0] = event.latlng.lat;
        this.points[1][1] = event.latlng.lng;
        this.addDestMarket();
      });
    },
    // Data
    points: [
      [59.39888, 17.96505],
      [59.34317, 18.03124],
    ] as GetRoutesRequest['points'],
    transportationModes: ['foot'] as GetRoutesRequest['transportationModes'],
    alternatives: 1 as GetRoutesRequest['alternatives'],
    routes: [] as Route[],
    loading: false,
    originMap: null,
    originMarker: null,
    destMap: null,
    destMarker: null,

    // Computed
    get disabled() {
      return this.transportationModes.length === 0;
    },

    // Methods
    async getRoutes() {
      const { points, transportationModes, alternatives } = this;
      this.loading = true;
      const [error, data] = await treqster.fetchRoutes({
        points,
        transportationModes,
        alternatives,
      });
      if (error) {
        console.error(error);
      } else {
        this.routes = data;
      }
      this.loading = false;
    },
    addOriginMarket() {
      if (this.originMarker !== null) {
        this.originMap.removeLayer(this.originMarker);
      }
      this.originMarker = new leaflet.Marker(this.points[0], {
        draggable: true,
      });
      this.originMarker.addTo(this.originMap);
    },
    addDestMarket() {
      if (this.destMarker !== null) {
        this.destMap.removeLayer(this.destMarker);
      }
      this.destMarker = new leaflet.Marker(this.points[1], {
        draggable: true,
      });
      this.destMarker.addTo(this.destMap);
    },

    // Utils
    formatTime(totalTime: number) {
      return humanizeDuration(minutesToMilliseconds(totalTime));
    },
    formatDistance(totalDistance: number) {
      const results = [];
      if (totalDistance >= 1000) {
        results.push(Math.round(totalDistance / 1000) + ' km');
      }
      results.push((totalDistance % 1000) + ' m');
      return results.join(' ');
    },
    upperFirst: upperFirst,
  };
});

Alpine.start();
