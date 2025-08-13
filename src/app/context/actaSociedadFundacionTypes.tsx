export interface AppState {
  bienvenido: boolean;
}

export interface actaSociedadFundacionTypes {
  store: AppState;
  setStore: React.Dispatch<React.SetStateAction<AppState>>;
}
