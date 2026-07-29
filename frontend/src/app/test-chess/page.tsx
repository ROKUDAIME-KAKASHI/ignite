"use client";

import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function TestChess() {
  const [game, setGame] = useState(new Chess());

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q"
      });
      if (move === null) return false;
      setGame(new Chess(game.fen()));
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div style={{ width: 400, margin: '50px auto' }}>
      <Chessboard 
        position={game.fen()} 
        onPieceDrop={onDrop} 
        arePiecesDraggable={true} 
      />
    </div>
  );
}
