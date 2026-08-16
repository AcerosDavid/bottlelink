import ffmpeg from 'fluent-ffmpeg';
import { FileMetadata } from '../types';

export interface MediaAnalysisResult {
  duration?: number;
  resolution?: string;
  fps?: number;
  video_codec?: string;
  audio_codec?: string;
  bitrate?: number;
  format?: string;
  streams?: number;
  languages?: string[];
  error?: string;
}

export class MediaAnalysisService {
  /**
   * Analyze a media file URL using FFmpeg
   * Note: This requires the file to be accessible and downloadable
   */
  static async analyzeMediaUrl(url: string): Promise<MediaAnalysisResult> {
    return new Promise((resolve) => {
      const result: MediaAnalysisResult = {};

      ffmpeg(url)
        .ffprobe((err, metadata) => {
          if (err) {
            console.error('FFmpeg error:', err);
            resolve({ error: err.message });
            return;
          }

          try {
            // Extract basic format information
            if (metadata.format) {
              result.format = metadata.format.format_name;
              result.duration = metadata.format.duration;
              result.bitrate = metadata.format.bit_rate;
            }

            // Extract stream information
            if (metadata.streams) {
              result.streams = metadata.streams.length;

              let videoCodec: string | undefined;
              let audioCodec: string | undefined;
              let resolution: string | undefined;
              let fps: number | undefined;
              const languages: string[] = [];

              for (const stream of metadata.streams) {
                // Video stream
                if (stream.codec_type === 'video') {
                  videoCodec = stream.codec_name;
                  
                  if (stream.width && stream.height) {
                    resolution = `${stream.width}x${stream.height}`;
                  }
                  
                  if (stream.r_frame_rate) {
                    const [num, den] = stream.r_frame_rate.split('/').map(Number);
                    if (den && den > 0) {
                      fps = num / den;
                    }
                  }
                }

                // Audio stream
                if (stream.codec_type === 'audio') {
                  audioCodec = stream.codec_name;
                  
                  if (stream.tags && stream.tags.language) {
                    languages.push(stream.tags.language);
                  }
                }
              }

              result.video_codec = videoCodec;
              result.audio_codec = audioCodec;
              result.resolution = resolution;
              result.fps = fps;
              result.languages = languages.length > 0 ? languages : undefined;
            }

            resolve(result);
          } catch (error) {
            console.error('Error parsing FFmpeg metadata:', error);
            resolve({ error: error instanceof Error ? error.message : 'Unknown error' });
          }
        });
    });
  }

  /**
   * Analyze a local media file path
   */
  static async analyzeMediaFile(filePath: string): Promise<MediaAnalysisResult> {
    return new Promise((resolve) => {
      const result: MediaAnalysisResult = {};

      ffmpeg(filePath)
        .ffprobe((err, metadata) => {
          if (err) {
            console.error('FFmpeg error:', err);
            resolve({ error: err.message });
            return;
          }

          try {
            // Extract basic format information
            if (metadata.format) {
              result.format = metadata.format.format_name;
              result.duration = metadata.format.duration;
              result.bitrate = metadata.format.bit_rate;
            }

            // Extract stream information
            if (metadata.streams) {
              result.streams = metadata.streams.length;

              let videoCodec: string | undefined;
              let audioCodec: string | undefined;
              let resolution: string | undefined;
              let fps: number | undefined;
              const languages: string[] = [];

              for (const stream of metadata.streams) {
                // Video stream
                if (stream.codec_type === 'video') {
                  videoCodec = stream.codec_name;
                  
                  if (stream.width && stream.height) {
                    resolution = `${stream.width}x${stream.height}`;
                  }
                  
                  if (stream.r_frame_rate) {
                    const [num, den] = stream.r_frame_rate.split('/').map(Number);
                    if (den && den > 0) {
                      fps = num / den;
                    }
                  }
                }

                // Audio stream
                if (stream.codec_type === 'audio') {
                  audioCodec = stream.codec_name;
                  
                  if (stream.tags && stream.tags.language) {
                    languages.push(stream.tags.language);
                  }
                }
              }

              result.video_codec = videoCodec;
              result.audio_codec = audioCodec;
              result.resolution = resolution;
              result.fps = fps;
              result.languages = languages.length > 0 ? languages : undefined;
            }

            resolve(result);
          } catch (error) {
            console.error('Error parsing FFmpeg metadata:', error);
            resolve({ error: error instanceof Error ? error.message : 'Unknown error' });
          }
        });
    });
  }

  /**
   * Extract media metadata and merge with existing file metadata
   */
  static async extractAndMergeMetadata(url: string, existingMetadata: Partial<FileMetadata>): Promise<Partial<FileMetadata>> {
    try {
      const mediaResult = await this.analyzeMediaUrl(url);
      
      if (mediaResult.error) {
        console.error('Media analysis failed:', mediaResult.error);
        return existingMetadata;
      }

      return {
        ...existingMetadata,
        duration: mediaResult.duration,
        resolution: mediaResult.resolution,
        fps: mediaResult.fps,
        video_codec: mediaResult.video_codec,
        audio_codec: mediaResult.audio_codec,
        bitrate: mediaResult.bitrate,
        format: mediaResult.format,
        streams: mediaResult.streams,
        languages: mediaResult.languages
      };
    } catch (error) {
      console.error('Error in extractAndMergeMetadata:', error);
      return existingMetadata;
    }
  }

  /**
   * Check if a file is likely a video file based on extension
   */
  static isVideoFile(extension: string): boolean {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'm4v', '3gp'];
    return videoExtensions.includes(extension.toLowerCase());
  }

  /**
   * Check if a file is likely an audio file based on extension
   */
  static isAudioFile(extension: string): boolean {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus'];
    return audioExtensions.includes(extension.toLowerCase());
  }

  /**
   * Check if media analysis should be performed for a file
   */
  static shouldAnalyzeMedia(mimeType?: string, extension?: string): boolean {
    if (mimeType) {
      return mimeType.startsWith('video/') || mimeType.startsWith('audio/');
    }
    
    if (extension) {
      return this.isVideoFile(extension) || this.isAudioFile(extension);
    }
    
    return false;
  }

  /**
   * Get human-readable media information
   */
  static getMediaInfoSummary(metadata: Partial<FileMetadata>): string {
    const parts: string[] = [];

    if (metadata.format) {
      parts.push(`Format: ${metadata.format}`);
    }

    if (metadata.duration) {
      const minutes = Math.floor(metadata.duration / 60);
      const seconds = Math.floor(metadata.duration % 60);
      parts.push(`Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }

    if (metadata.resolution) {
      parts.push(`Resolution: ${metadata.resolution}`);
    }

    if (metadata.fps) {
      parts.push(`FPS: ${metadata.fps.toFixed(2)}`);
    }

    if (metadata.video_codec) {
      parts.push(`Video: ${metadata.video_codec}`);
    }

    if (metadata.audio_codec) {
      parts.push(`Audio: ${metadata.audio_codec}`);
    }

    if (metadata.bitrate) {
      const mbps = (metadata.bitrate / 1000000).toFixed(2);
      parts.push(`Bitrate: ${mbps} Mbps`);
    }

    return parts.join(', ') || 'No media information available';
  }
}
