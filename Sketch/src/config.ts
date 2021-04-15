import { ImmutableObject } from 'seamless-immutable';
import { IMJimuMapConfig } from 'jimu-ui/advanced/map';

export interface Config extends IMJimuMapConfig{
  exampleConfigProperty: string;
}

export type IMConfig = ImmutableObject<Config>;

export type ToolConfig = { [key: string]: boolean }
