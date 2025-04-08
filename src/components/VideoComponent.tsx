import { Search } from "lucide-react";
import AuthComponent from "./AuthComponent";
import React, { useEffect, useState, useRef } from "react";
import {
  VeltCommentsSidebar,
  VeltCommentPlayerTimeline,
  VeltSidebarButton,
  VeltComments,
  useCommentModeState,
  useVeltClient,
} from "@veltdev/react";
import { Player } from "video-react";
import VeltDocument from "./VeltDocument";

export default function VideoComponent() {
  const { client } = useVeltClient();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const commentPlayerTimelineRef = useRef<any>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const timePassedDivRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const commentModeState = useCommentModeState();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
      updateCustomTimeline();
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("pause", () => setIsPlaying(false));
    video.addEventListener("play", () => setIsPlaying(true));

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("pause", () => setIsPlaying(false));
      video.removeEventListener("play", () => setIsPlaying(true));
    };
  }, []);

  const handleSeek = (event: any) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const newTime = (offsetX / rect.width) * video.duration;
    video.currentTime = newTime;
    setLocation();
  };

  function secondsToReadableTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const secs: number = Math.floor(seconds % 60);

    return [
      hours > 0 ? String(hours).padStart(2, "0") : null,
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ]
      .filter(Boolean)
      .join(":");
  }

  const setLocation = () => {
    if (videoRef.current && client) {
      let location = {
        id: secondsToReadableTime(videoRef.current.currentTime),
        locationName: secondsToReadableTime(videoRef.current.currentTime),
        currentMediaPosition: videoRef.current.currentTime,
        videoPlayerId: "videoPlayerId",
      };
      client.setLocation(location);
    }
  };

  useEffect(() => {
    if (commentModeState && videoRef.current && client) {
      //   videoRef.current.pause();
      togglePlayPause();
      setLocation();
    }
  }, [commentModeState, videoRef.current, client]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const updateCustomTimeline = () => {
    if (videoRef.current && timePassedDivRef.current) {
      const seekPercent =
        (videoRef.current.currentTime / videoRef.current.duration) * 100 - 1.5;
      timePassedDivRef.current.style.width = `${seekPercent}%`;
    }
  };

  //   const onSpaceKey = (event: KeyboardEvent) => {
  //     if (event.code === "Space") {
  //       event.preventDefault();
  //       togglePlayPause();
  //     }
  //   };

  //   useEffect(() => {
  //     document.addEventListener("keydown", onSpaceKey);
  //     return () => document.removeEventListener("keydown", onSpaceKey);
  //   }, []);

  const handleCommentClick = (event: any) => {
    const { detail } = event;
    if (detail && videoRef.current) {
      videoRef.current.currentTime = detail.location.currentMediaPosition;
      setLocation();
      updateCustomTimeline();
    }
  };

  const onTimelineCommentClick = (event: any) => {
    if (event) {
      const { location } = event.detail || {};
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (location) {
        // const { currentMediaPosition } = location;
        if (videoRef.current?.paused) {
          // Pause the player
          //   togglePlayPause()

          // Seek to the given comment media position
          videoRef.current.currentTime = location.currentMediaPosition;

          // Set the Velt Location to the clicked comment location
          client.setLocation(location);
        }
      }
    }
  };

  useEffect(() => {
    const commentSidebar = document.querySelector("velt-comments-sidebar");
    if (!commentSidebar) return;

    commentSidebar.addEventListener("onCommentClick", handleCommentClick);

    if (!commentPlayerTimelineRef.current) return;

    commentPlayerTimelineRef.current.addEventListener(
      "onCommentClick",
      handleCommentClick
    );

    return () => {
      commentSidebar.removeEventListener("onCommentClick", handleCommentClick);
      commentPlayerTimelineRef.current.removeEventListener(
        "onCommentClick",
        handleCommentClick
      );
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between w-full p-4">
        <div className="relative w-[75%]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full pl-12 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          />
        </div>
        <AuthComponent />
      </div>

      <div className="w-full mt-6 px-4">
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            id="videoPlayerId"
            ref={videoRef}
            src="/video/main-video.mp4"
            className="w-full h-full object-cover border"
            controls
            poster="/video/video-cover.png"
          >
            <source src="/video/main-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div
            className="absolute bottom-0 left-0 w-full h-2 bg-gray-200 cursor-pointer"
            ref={progressBarRef}
            onClick={handleSeek}
          >
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            ></div>
            <div
              className="absolute bottom-0 left-0 h-full bg-red-500"
              ref={timePassedDivRef}
              style={{ width: `0%` }}
            ></div>
          </div>

          <VeltCommentPlayerTimeline
            videoPlayerId="videoPlayerId"
            totalMediaLength={144}
            // ref={commentPlayerTimelineRef}
            onTimelineCommentClick={onTimelineCommentClick}
          />
        </div>

        <div className="mt-4 flex">
          <Player
            playsInline
            poster="/assets/poster.png"
            src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
          />
          <div>
            <h1 className="text-xl font-bold">Big Buck Bunny</h1>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <span>123,456 views</span>
              <span className="mx-2">•</span>
              <span>Published on Apr 15, 2023</span>
            </div>
          </div>

          <div id="comment-section" className="pl-16 pb-6">
            <VeltComments
              mode="stream"
              allowedElementQuerySelectors={["#videoPlayerId"]}
              defaultIsOpen={true}
            />
            <VeltDocument />
            <VeltCommentsSidebar onCommentClick={handleCommentClick} />
            <VeltSidebarButton />
          </div>
        </div>
      </div>
    </div>
  );
}
