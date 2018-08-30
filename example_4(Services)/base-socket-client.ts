import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';

/* tslint:disable:no-import-side-effect */

export abstract class BaseSocketClient {

  private socket: SocketIOClient.Socket;

  public connect(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.socket = io(this.getConfig().host, {
        query: `token=${JSON.parse(token).access_token}`,
        reconnection: true,
        reconnectionDelay: 3000,
        timeout: 5000,
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /* tslint:disable:no-empty*/
  public getConfig(): any {}

  public messageInterceptor(message: any): any {
    return message;
  }

  public emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  public on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data: any) => {
        observer.next(this.messageInterceptor(data));
      });
    });
  }
}

/* tslint:disable:function-name variable-name*/
/**
 * Set the base URL of Socket resource
 * @param {Object} config - Socket configuration
 */
export function Configuration(config: Object) {
  return function <TFunction extends Function>(Target: TFunction): TFunction {
    Target.prototype.getConfig = function () { return config; };

    return Target;
  };
}
