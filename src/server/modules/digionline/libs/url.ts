import config from '../../../../../config/config.json';

export function getUrlPath(withCredentials: boolean = false): string {
  return config.web.auth.enabled && withCredentials
    ? `${config.web.ssl ? 'https' : 'http'}://${config.web.auth.user}:${config.web.auth.password}@${
        config.web.domain
      }:${config.web.outerPort}`
    : `${config.web.ssl ? 'https' : 'http'}://${config.web.domain}:${config.web.outerPort}`;
}
