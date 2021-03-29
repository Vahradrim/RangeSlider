
// Range slider for React Native (fully compatible with Expo)
// MIT License
// -----------
// Copyright (c) 2021 Hugo Bounoua
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

/* EXAMPLE OF USE :
<RangeSlider
  name="Price" icon="ticket-percent-outline"
  boundaryMin={0} boundaryMax={99}
  initValMin={12} initValMax={88}
/>
*/

import React from "react";
import { StyleSheet, View, PanResponder, Animated, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function RangeSlider(props)
{
  // ------------------ OPTIONS ------------------------ //
  // (Use props._VALUE_ in this section if needed)
  const name = "Price";
  const icon = "ticket-percent-outline";
  const minBoundary = 0;
  const maxBoundary = 99;
  const min_initVal = 12;
  const max_initVal = 88;
  const colorNeutral = "#f1f1f1";
  const colorHighlight = "#008ee6";
  // Next line is the position's difference of min slider and max slider
  // To avoid overlap and blocking at the maximum boundary value
  // Keep between 0.10 and 0.40 for best user experience
  const manualOffsetBetweenSlider = 0.10;

  // ----------------- Common ----------------------- //
  const [forceRender, setForceRender] = React.useState(0);
  const [sliderHeight, setSliderHeight] = React.useState(0);
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const [sliderCenter, setSliderCenter] = React.useState(0);
  
  const initSliders = (height, width) =>
  {
    // Set sizes
    let sWidth = width - height // - height : Avoid the slider to overlap the borders
    const center = sWidth / 2;
    const stepWidth = sWidth / (maxBoundary - minBoundary);
    setSliderHeight(height);
    setSliderWidth(sWidth);
    setSliderCenter(center);

    // Init min slider
    const min_initOff = (min_initVal - ((maxBoundary - minBoundary) / 2)) * stepWidth;
    min_setInitOffset(min_initOff);
    const minPos = (-sWidth/2) - min_initOff;
    min_setMinBoundaryPosition(minPos);
    min_setMaxBoundaryPosition(minPos + sWidth);
    min_animState.sliderHeight = height;
    min_animState.sliderWidth = sWidth;
    min_animState.stepWidth = stepWidth;
    min_animState.minBoundary = minBoundary;
    min_animState.maxBoundary = maxBoundary;
    min_animState.initOffSet = min_initOff;
    min_animState.minBoundaryPosition = minPos;
    min_animState.maxBoundaryPosition = minPos + sWidth;

    // Init max slider
    const max_initOff = (max_initVal - ((maxBoundary - minBoundary) / 2)) * stepWidth;
    max_setInitOffset(max_initOff);
    const maxPos = (-sWidth/2) - max_initOff;
    max_setMinBoundaryPosition(maxPos);
    max_setMaxBoundaryPosition(maxPos + sWidth);
    max_animState.sliderHeight = height;
    max_animState.sliderWidth = sWidth;
    max_animState.stepWidth = stepWidth;
    max_animState.minBoundary = minBoundary;
    max_animState.maxBoundary = maxBoundary;
    max_animState.initOffSet = max_initOff;
    max_animState.minBoundaryPosition = maxPos;
    max_animState.maxBoundaryPosition = maxPos + sWidth;

    // Initialize sliders
    placeSlider(min_pan.x._value, min_animState, max_animState, max_setMinBoundaryPosition, true);
    placeSlider(max_pan.x._value, max_animState, min_animState, min_setMaxBoundaryPosition, false);
  };

  // Main function, placing the slider, contraining it and changing the overlap limit of the other slider
  const placeSlider = (position, state, otherSliderState, setBoundary, isMin = true) =>
  {
    let newVal =
      position +
      state.offSet +
      state.initOffSet +
      state.sliderWidth/2 -
      state.clampOffSet;

    // Make sure the value is constrained in boundaries
    newVal = Math.max(
      state.minBoundaryPosition + state.initOffSet + state.sliderWidth/2,
      Math.min(
        state.maxBoundaryPosition + state.initOffSet + state.sliderWidth/2,
        newVal));

    // Constrain the other slider to avoid overlap
    let newBoundary = 0;
    if(isMin === true)
    {
      // Unlock the slider position
      state.effectiveMaxBoundaryPosition = state.maxBoundaryPosition;
      // Constrain the minimum of the max slider
      newBoundary = Math.min(
        newVal - otherSliderState.initOffSet - state.sliderWidth/2,
        otherSliderState.maxBoundaryPosition);
      setBoundary(newBoundary);
      otherSliderState.minBoundaryPosition = newBoundary;
    }
    else
    {
      // Unlock the slider position
      state.effectiveMinBoundaryPosition = state.minBoundaryPosition;
      // Constrain the maximum of the min slider
      newBoundary = Math.max(
        newVal - otherSliderState.initOffSet - state.sliderWidth/2,
        otherSliderState.minBoundaryPosition);
      setBoundary(newBoundary);
      otherSliderState.maxBoundaryPosition = newBoundary;
    }

    // Set the value
    state.displayVal = Math.trunc((newVal + state.stepWidth/2) / state.stepWidth);
    setForceRender(newVal); // Update the state so the render function is called (and elements are updated on screen)
    state.currentVal = newVal - state.initOffSet - state.sliderWidth/2;
  }

  // ----------------- Min slider ----------------------- //
  const min_pan = React.useRef(new Animated.ValueXY()).current;
  const [min_initOffset, min_setInitOffset] = React.useState(0);
  const [min_minBoundaryPosition, min_setMinBoundaryPosition] = React.useState(0);
  const [min_maxBoundaryPosition, min_setMaxBoundaryPosition] = React.useState(0);
  const [min_effectiveMaxBoundaryPosition, min_setEffectiveMaxBoundaryPosition] = React.useState(0);
  const min_animState = React.useRef(
  {
    currentVal: 0,
    displayVal:0,
    sliderWidth:0,
    stepWidth:0,
    minBoundary:0,
    maxBoundary:0,
    minBoundaryPosition:0,
    maxBoundaryPosition:0,
    effectiveMaxBoundaryPosition:0,
    offSet: 0,
    clampOffSet: 0,
    initOffSet: 0,
  }).current;

  const min_getPanResponder = () =>
  {
    return PanResponder.create(
    {
        onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
        onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => // When the slider starts moving
        {
          const clamp = Math.max(min_animState.minBoundaryPosition, Math.min(min_animState.maxBoundaryPosition, min_animState.currentVal));
          min_animState.clampOffSet = min_animState.clampOffSet + min_pan.x._value - clamp;
          min_pan.setOffset({x: clamp, y: 0});
        },
        onPanResponderMove: (e, gesture) => // When the slider moves
        {
          min_setEffectiveMaxBoundaryPosition(min_animState.maxBoundaryPosition);
          placeSlider(min_pan.x._value, min_animState, max_animState, max_setMinBoundaryPosition, true);
          Animated.event([null, { dx: min_pan.x, dy: min_pan.y }], {})(e, {dx:gesture.dx, dy:0});
        },
        onPanResponderRelease: (e, gesture) => // When the slider is released
        {
          // Lock the slider position
          min_animState.effectiveMaxBoundaryPosition = min_animState.currentVal;
          min_setEffectiveMaxBoundaryPosition(min_animState.currentVal);
          // Save slider's offset
          min_animState.offSet = min_animState.offSet + min_pan.x._value;
          min_pan.flattenOffset();
        }
    });
  };
  const [min_panResponder, min_setPanResponder] = React.useState(min_getPanResponder());

  const min_getSlider = () =>
  {
    return (
      <Animated.View
        style={[
          s.draggable,
          { transform:
            [{ translateX: min_pan.x.interpolate(
              {
                inputRange: [Math.min(min_minBoundaryPosition, min_effectiveMaxBoundaryPosition), Math.max(min_minBoundaryPosition, min_effectiveMaxBoundaryPosition)],
                outputRange: [Math.min(min_minBoundaryPosition, min_effectiveMaxBoundaryPosition), Math.max(min_minBoundaryPosition, min_effectiveMaxBoundaryPosition)],
                extrapolate: 'clamp'
              })
            }]
          },
          {left:sliderCenter + min_initOffset - sliderHeight*manualOffsetBetweenSlider}
        ]}
        {...min_panResponder.panHandlers}
      >
        <View style={s.circle}>
          <View style={s.icon}>
            <MaterialCommunityIcons name={icon} size={20} color={colorHighlight} />
          </View>
          <View style={s.labelContainer}>
            <Text style={s.label}>{name}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const min_getLine = () =>
  {
    return(
      <Animated.View style={[
        s.line,
        [{ translateX: min_pan.x.interpolate(
          {
            inputRange: [Math.min(min_minBoundaryPosition, min_effectiveMaxBoundaryPosition), Math.max(min_minBoundaryPosition, min_effectiveMaxBoundaryPosition)],
            outputRange: [
              Math.min(min_minBoundaryPosition + min_initOffset - sliderWidth/2 - sliderHeight*manualOffsetBetweenSlider,
              min_effectiveMaxBoundaryPosition + min_initOffset - sliderWidth/2 - sliderHeight*manualOffsetBetweenSlider), 
              Math.max(min_minBoundaryPosition + min_initOffset - sliderWidth/2 - sliderHeight*manualOffsetBetweenSlider,
              min_effectiveMaxBoundaryPosition + min_initOffset - sliderWidth/2 - sliderHeight*manualOffsetBetweenSlider), ],
            extrapolate: 'clamp'
          })
        }],
        {backgroundColor:colorNeutral}
        ]}
      />
    );
  }

  // ----------------- Max slider ----------------------- //
  const max_pan = React.useRef(new Animated.ValueXY()).current;
  const [max_initOffset, max_setInitOffset] = React.useState(0);
  const [max_minBoundaryPosition, max_setMinBoundaryPosition] = React.useState(0);
  const [max_maxBoundaryPosition, max_setMaxBoundaryPosition] = React.useState(0);
  const [max_effectiveMinBoundaryPosition, max_setEffectiveMinBoundaryPosition] = React.useState(0);
  const max_animState = React.useRef(
  {
    currentVal: 0,
    displayVal:0,
    sliderWidth:0,
    stepWidth:0,
    minBoundary:0,
    maxBoundary:0,
    minBoundaryPosition:0,
    maxBoundaryPosition:0,
    effectiveMinBoundaryPosition:0,
    offSet: 0,
    clampOffSet: 0,
    initOffSet: 0,
  }).current;

  const max_getPanResponder = () =>
  {
    return PanResponder.create(
    {
        onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
        onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () =>
        {
          const clamp = Math.max(max_animState.minBoundaryPosition, Math.min(max_animState.maxBoundaryPosition, max_animState.currentVal));
          max_animState.clampOffSet = max_animState.clampOffSet + max_pan.x._value - clamp;
          max_pan.setOffset({x: clamp, y: 0 });
        },
        onPanResponderMove: (e, gesture) =>
        {
          max_setEffectiveMinBoundaryPosition(max_animState.minBoundaryPosition);
          placeSlider(max_pan.x._value, max_animState, min_animState, min_setMaxBoundaryPosition, false);
          Animated.event([null, { dx: max_pan.x, dy: max_pan.y }], {})(e, {dx:gesture.dx, dy:0});
        },
        onPanResponderRelease: (evt, gestureState) =>
        {
          max_animState.effectiveMinBoundaryPosition = max_animState.currentVal;
          max_setEffectiveMinBoundaryPosition(max_animState.currentVal);
          max_animState.offSet = max_animState.offSet + max_pan.x._value;
          max_pan.flattenOffset();
        }
    });
  };
  const [max_panResponder, max_setPanResponder] = React.useState(max_getPanResponder());

  const max_getSlider = () =>
  {
    return (
      <Animated.View
        style={[
          s.draggable,
          { transform:
            [{ translateX: max_pan.x.interpolate(
              {
                inputRange: [Math.min(max_effectiveMinBoundaryPosition, max_maxBoundaryPosition), Math.max(max_effectiveMinBoundaryPosition, max_maxBoundaryPosition)],
                outputRange: [Math.min(max_effectiveMinBoundaryPosition, max_maxBoundaryPosition), Math.max(max_effectiveMinBoundaryPosition, max_maxBoundaryPosition)],
                extrapolate: 'clamp'
              })
            }]
          },
          {left:sliderCenter + max_initOffset + sliderHeight*manualOffsetBetweenSlider}
        ]}
        {...max_panResponder.panHandlers}
      >
        <View style={s.circle}>
          <View style={s.icon}>
            <MaterialCommunityIcons name={icon} size={30} color={colorHighlight} />
          </View>
          <View style={s.labelContainer}>
            <Text style={s.label}>{name}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const max_getLine = () =>
  {
    return(
      <Animated.View style={[
        s.line,
        [{ translateX: max_pan.x.interpolate(
          {
            inputRange: [Math.min(max_effectiveMinBoundaryPosition, max_maxBoundaryPosition), Math.max(max_effectiveMinBoundaryPosition, max_maxBoundaryPosition)],
            outputRange: [
              Math.min(max_effectiveMinBoundaryPosition + sliderWidth/2 + max_initOffset + sliderHeight*manualOffsetBetweenSlider,
              max_maxBoundaryPosition + sliderWidth/2 + max_initOffset + sliderHeight*manualOffsetBetweenSlider),
              Math.max(max_effectiveMinBoundaryPosition + sliderWidth/2 + max_initOffset + sliderHeight*manualOffsetBetweenSlider,
              max_maxBoundaryPosition + sliderWidth/2 + max_initOffset + sliderHeight*manualOffsetBetweenSlider),],
            extrapolate: 'clamp'
          })
        }],
        {backgroundColor:colorNeutral}
        ]}
      />
    );
  }
  
  // ----------------- Render ----------------------- //
  return (
    <View style={s.mainContainer}>
      <View style={s.container}>
        <View style={s.labelValue}>
          <Text style={s.labelValueText}>{min_animState.displayVal}</Text>
        </View>
        <View
          style={[s.sliderContainer, {marginHorizontal:sliderHeight*manualOffsetBetweenSlider}]}
          onLayout={(event) => initSliders(event.nativeEvent.layout.height, event.nativeEvent.layout.width)}
        >
          <View style={[s.lineContainer, {backgroundColor:colorHighlight}]}>
            {min_getLine()}
            {max_getLine()}
          </View>
          {min_getSlider()}
          {max_getSlider()}
        </View>
        <View style={s.labelValue}>
          <Text style={s.labelValueText}>{max_animState.displayVal}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  mainContainer:
  {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width:"100%",
    aspectRatio:4,
  },
  container:
  {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flex: 1,
    flexDirection: "row",
  },

  labelValue:
  {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flex: 1,
  },
  labelValueText:
  {
    fontSize:11,
  },

  sliderContainer:
  {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    height:"100%",
    flex: 8,
    overflow:'visible',
  },
  lineContainer:
  {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    height:4,
    width:"80%",
    flexDirection:'row',
    position: "absolute",
    left:"10%",
    top:"50%",
    marginTop:-3,
    borderRadius: 60,
  },
  line:
  {
    height:"100%",
    width:"100%",
    position:'absolute',
  },
  draggable:
  {
    alignItems: "center",
    justifyContent: "center",
    height:"100%",
    aspectRatio:1,
    position:'absolute',
    top:-5,
    flexDirection:'row',
    borderRadius:100,
    overflow: "visible",
  },
  circle:
  {
    backgroundColor: "#f1f1f1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 2.8,
    elevation: 3,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    aspectRatio: 1,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderWidth: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#f1f1f1",
    overflow: "visible",
  },
  icon:
  {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    height:"100%",
    width:"80%",
    paddingBottom:10
  },
  labelContainer:
  {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width:"100%",
    aspectRatio:3,
    position:'absolute',
    bottom:0,
  },
  label:
  {
    fontSize:9,
  },
});
