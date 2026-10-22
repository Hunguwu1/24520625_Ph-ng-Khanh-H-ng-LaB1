export type TrackStatus =
  | 'queued'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'completed'
  | 'cancelled'
  | 'error';

// Dữ liệu của một bài trong hàng đợi.
export interface AudioTrack {
  id: string;
  url: string;
  status: TrackStatus;
  controller: AbortController;
  buffer?: AudioBuffer;
  error?: string;
}

// Dữ liệu gửi ra giao diện không chứa buffer hoặc controller nội bộ.
export type TrackInfo = Readonly<Pick<AudioTrack, 'id' | 'url' | 'status' | 'error'>>;

export interface AudioEngineState {
  readonly tracks: readonly TrackInfo[];
  readonly playbackActive: boolean;
}
