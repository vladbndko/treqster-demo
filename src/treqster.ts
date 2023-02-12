import ky from 'ky';
import GetRoutesRequest from './types/GetRoutesRequest';
import Route from './types/Route';

const TREQSTER_API_HOST = import.meta.env.VITE_TREQSTER_API_HOST;

const treqsterClient = ky.create({
  prefixUrl: TREQSTER_API_HOST,
});

const treqster = {
  async fetchRoutes(request: GetRoutesRequest) {
    try {
      const response = await treqsterClient.post('routing/routes', {
        body: JSON.stringify(request),
      });
      const data = await response.json();
      return [null, data as Route[]];
    } catch (error) {
      return [error];
    }
  },
};

export default treqster;
