export const PLAYER_ID_KEY = 'birthday_qr_player_id';
export const PLAYER_NAME_KEY = 'birthday_qr_player_name';

export function setLocalPlayer(playerId: string, playerName: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAYER_ID_KEY, playerId);
  localStorage.setItem(PLAYER_NAME_KEY, playerName);
}

export function getLocalPlayer() {
  if (typeof window === 'undefined') return { playerId: null, playerName: null };
  return {
    playerId: localStorage.getItem(PLAYER_ID_KEY),
    playerName: localStorage.getItem(PLAYER_NAME_KEY),
  };
}
