// VideoPlayer.js
import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'; // Import Video.js styles

export default function Player({ options }){
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Initialize Video.js player
        if (!playerRef.current) {
            playerRef.current = videojs(videoRef.current, options, () => {
                console.log('Player is ready');
            });
        }

        // Cleanup function to dispose of the player
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [options]);

    return (
        <div>
            <div data-vjs-player>
                <video ref={videoRef} className="video-js vjs-big-play-centered" />
            </div>
        </div>
    );
};