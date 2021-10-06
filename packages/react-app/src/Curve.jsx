import React, { useRef, useEffect } from "react";

const Curve = props => {
  let ref = useRef();

  useEffect(() => {
    let canvas = ref.current;
    const textSize = 16;
    const width = canvas.width;
    const height = canvas.height;
    const arcRadius = 5;
    const scaleFactor = 0.8;

    if (canvas.getContext && props.dexReserve && props.tokenReserve) {
      const k = props.dexReserve * props.tokenReserve;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);

      let maxX = k / (props.dexReserve * scaleFactor);
      let minX = 0;

      if (props.removingToken || props.addingToken) {
        maxX = k / (props.dexReserve * scaleFactor);
        // maxX = k / (props.dexReserve * 0.8);
        // minX = k / Math.max(0, 2 * scaleFactor * 540 - props.dexReserve);
        minX = k / Math.max(0, 540 - props.dexReserve);
      }

      // const maxY = (2 * scaleFactor * maxX * height) / width;
      const maxY = (maxX * height) / width;
      const minY = (minX * height) / width;

      const plotX = x => {
        return ((x - minX) / (maxX - minX)) * width;
      };

      const plotY = y => {
        return height - ((y - minY) / (maxY - minY)) * height;
      };
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#000000";
      ctx.font = textSize + "px Arial";
      // +Y axis
      ctx.beginPath();
      ctx.moveTo(plotX(minX), plotY(0));
      ctx.lineTo(plotX(minX), plotY(maxY));
      ctx.stroke();
      // +X axis
      ctx.beginPath();
      ctx.moveTo(plotX(0), plotY(minY));
      ctx.lineTo(plotX(maxX), plotY(minY));
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      let first = true;
      for (var x = minX; x <= maxX; x += maxX / width) {
        /////
        var y = k / x;
        /////
        if (first) {
          ctx.moveTo(plotX(x), plotY(y));
          first = false;
        } else {
          ctx.lineTo(plotX(x), plotY(y));
        }
      }
      ctx.stroke();

      ctx.lineWidth = 1;

      if (props.removingToken) {
        let newReserve = props.dexReserve + parseFloat(props.removingToken);

        ctx.fillStyle = "#bbbbbb";
        ctx.beginPath();
        ctx.arc(plotX(newReserve), plotY(k / newReserve), arcRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "#009900";
        drawArrow(
          ctx,
          plotX(props.dexReserve),
          plotY(props.tokenReserve),
          plotX(newReserve),
          plotY(props.tokenReserve),
        );

        ctx.fillStyle = "#000000";
        ctx.fillText(
          "" + props.removingToken + ` ${props.coinName} input`,
          plotX(props.dexReserve) + textSize,
          plotY(props.tokenReserve) - textSize,
        );

        ctx.strokeStyle = "#990000";
        drawArrow(ctx, plotX(newReserve), plotY(props.tokenReserve), plotX(newReserve), plotY(k / newReserve));

        let amountGained = Math.round((10000 * (props.removingToken * props.tokenReserve)) / newReserve) / 10000;
        ctx.fillStyle = "#000000";
        ctx.fillText("" + amountGained + " 💰 output (-0.3% fee)", plotX(newReserve) + textSize, plotY(k / newReserve));
      } else if (props.addingToken) {
        let newTokenReserve = props.tokenReserve + parseFloat(props.addingToken);

        ctx.fillStyle = "#bbbbbb";
        ctx.beginPath();
        ctx.arc(plotX(k / newTokenReserve), plotY(newTokenReserve), arcRadius, 0, 2 * Math.PI);
        ctx.fill();

        //console.log("newTokenReserve",newTokenReserve)
        ctx.strokeStyle = "#990000";
        drawArrow(
          ctx,
          plotX(props.dexReserve),
          plotY(props.tokenReserve),
          plotX(props.dexReserve),
          plotY(newTokenReserve),
        );

        ctx.fillStyle = "#000000";
        ctx.fillText(
          "" + props.addingToken + " 💰 input",
          plotX(props.dexReserve) + textSize,
          plotY(props.tokenReserve),
        );

        ctx.strokeStyle = "#009900";
        drawArrow(
          ctx,
          plotX(props.dexReserve),
          plotY(newTokenReserve),
          plotX(k / newTokenReserve),
          plotY(newTokenReserve),
        );

        let amountGained = Math.round((10000 * (props.addingToken * props.dexReserve)) / newTokenReserve) / 10000;
        //console.log("amountGained",amountGained)
        ctx.fillStyle = "#000000";
        ctx.fillText(
          "" + amountGained + ` ${props.coinName} output (-0.3% fee)`,
          plotX(k / newTokenReserve) + textSize,
          plotY(newTokenReserve) - textSize,
        );
      }

      ctx.fillStyle = "#0000FF";
      ctx.beginPath();
      ctx.arc(plotX(props.dexReserve), plotY(props.tokenReserve), arcRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [props]);

  return (
    <div style={{ margin: 32, position: "relative", width: props.width, height: props.height }}>
      <canvas style={{ position: "absolute", left: 0, top: 0 }} ref={ref} {...props} />
      <div style={{ position: "absolute", left: "20%", bottom: -20 }}>-- {props.coinName} Reserve --&gt;</div>
      <div
        style={{ position: "absolute", left: -20, bottom: "20%", transform: "rotate(-90deg)", transformOrigin: "0 0" }}
      >
        -- Token Reserve --&gt;
      </div>
    </div>
  );
};

export default Curve;

const drawArrow = (ctx, x1, y1, x2, y2) => {
  let [dx, dy] = [x1 - x2, y1 - y2];
  let norm = Math.sqrt(dx * dx + dy * dy);
  let [udx, udy] = [dx / norm, dy / norm];
  const size = norm / 7;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 + udx * size - udy * size, y2 + udx * size + udy * size);
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 + udx * size + udy * size, y2 - udx * size + udy * size);
  ctx.stroke();
};
