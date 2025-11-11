import type { Router } from "express";

export interface IAction {
  name: string;
  handler: (...args: any[]) => Promise<any> | any;
}

export interface IModule {
  name: string;
  prefix: string; // e.g., '/auth', '/users'
  router: Router;
}
