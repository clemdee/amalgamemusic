import type { MaybeRef } from 'vue';
import type { Music } from './music';
import { toValue } from 'vue';

export interface MusicPart {
  src: string
  offset: number
  duration: number
  buffer: AudioBuffer
}

const audioContext = new AudioContext();

export const useAudioContext = () => {
  return audioContext;
};

const outputNode = new GainNode(audioContext);
outputNode.connect(audioContext.destination);

let destinationInput: AudioNode = outputNode;

export const connectOutputNode = (to: AudioNode) => {
  destinationInput.disconnect();
  destinationInput.connect(to);
  destinationInput = to;
  to.connect(audioContext.destination);
};

export const createAudioBufferNode = (buffer: AudioBuffer) => {
  const audioNode = audioContext.createBufferSource();
  audioNode.buffer = buffer;
  audioNode.connect(outputNode);
  return audioNode;
};

const musicParts: Record<string, MusicPart> = {};

const preloadMusicPart = async (music: MaybeRef<Music>, partIndex: number): Promise<MusicPart> => {
  const _music = toValue(music);

  const musicPart = _music.parts[partIndex];
  const musicPartId = `${_music.id}-${partIndex}`;
  if (!musicParts[musicPartId]) {
    // If part has not already been loaded
    // Fetch, create and cache buffer
    const response = await fetch(musicPart.src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const loadedMusicPart = {
      src: musicPart.src,
      offset: musicPart.offset ?? 0,
      duration: musicPart.duration,
      buffer: audioBuffer,
    };
    musicParts[musicPartId] = loadedMusicPart;
  }
  return musicParts[musicPartId];
};

export const preloadMusicParts = async (music: MaybeRef<Music>) => {
  const _music = toValue(music);
  return await Promise.all(
    _music.parts.map((_part, partIndex) => preloadMusicPart(_music, partIndex)),
  );
};
