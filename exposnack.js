import React, { Component } from 'react';
import { Text, View, StyleSheet, Animated } from 'react-native';
import { NativeRouter, Route, Link, Switch } from "react-router-native";

const Home = () =>
  <Text style={styles.header}>
    Home
  </Text>;

const About = () =>
  <Text style={styles.header}>
    About
  </Text>;

const Topic = ({ match }) =>
  <Text style={styles.topic}>
    {match.params.topicId}
  </Text>;

const Topics = ({ match }) =>
  <View>
    <Text style={styles.header}>Topics</Text>
    <View>
      <Link
        to={`${match.url}/rendering`}
        style={styles.subNavItem}
        underlayColor="#f0f4f7"
      >
        <Text>Rendering with React</Text>
      </Link>
      <Link
        to={`${match.url}/components`}
        style={styles.subNavItem}
        underlayColor="#f0f4f7"
      >
        <Text>Components</Text>
      </Link>
      <Link
        to={`${match.url}/props-v-state`}
        style={styles.subNavItem}
        underlayColor="#f0f4f7"
      >
        <Text>Props v. State</Text>
      </Link>
    </View>

    <Route path={`${match.url}/:topicId`} component={Topic} />
    <Route
      exact
      path={match.url}
      render={() => <Text style={styles.topic}>Please select a topic.</Text>}
    />
  </View>;

class App extends Component {
  render() {
    return (
  <NativeRouter>
    <View style={styles.container}>
      <View style={styles.nav}>
        <Link to="/" underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>Home</Text>
        </Link>
        <Link to="/about" underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>About</Text>
        </Link>
        <Link to="/topics" underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>Topics</Text>
        </Link>
      </View>

      <Route render={({ location }) => <Pages location={location} />} />
    </View>
  </NativeRouter>
  )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    padding: 10,
    flex: 1
  },
  header: {
    fontSize: 20
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    padding: 10
  },
  subNavItem: {
    padding: 5
  },
  topic: {
    textAlign: "center",
    fontSize: 15
  }
});

export default App;

//ANIMATION

//For using with react-native-animatable
const AnimationSlideInRight = {
  from: { transform: [{ translateX: 500 }] },
  to: { transform: [{ translateX: 0 }] }
};

const AnimationSlideInLeft = {
  from: { transform: [{ translateX: -500 }] },
  to: { transform: [{ translateX: 0 }] }
};

const AnimationZoomOutRight = {
  from: { transform: [{ translateX: 0 }, { scale: 1 }] },
  to: { transform: [{ translateX: 200 }, { scale: 0.3 }] }
};

const AnimationSlideOutLeft = {
  from: { transform: [{ translateX: 0 }], opacity: 1 },
  to: { transform: [{ translateX: 500 }], opacity: 0 }
};

function animationEnterForKey(key) {
  return key === "/topics" ? AnimationSlideInLeft : AnimationSlideInRight;
}

function animationLeaveForKey(key) {
  return key === "/" ? AnimationZoomOutRight : AnimationSlideOutLeft;
}

//Mini implementation of AnimatedView in place of react-native-animatable - for expo snack
class AnimatedView extends Component {
  state = {
    animatedStyle: null
  };

  componentDidMount() {
    this.animate(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.animation !== nextProps.animation) {
      this.animate(nextProps);
    }
  }

  animate(props) {
    const { animation, duration, useNativeDriver } = props;
    const { from, to } = animation;

    const toParallel = [];
    const animatedStyle = {};

    //for quickly finding from transform value by key
    const fromTransform = (from["transform"] || [])
      .reduce((acc, transform) => ({ ...acc, ...transform }), {});

    console.log("from", fromTransform);

    //Setup animated values and the animation from-to.
    //Doesn't support from values that don't have "to" values
    Object.keys(to || {}).forEach(valueKey => {
      const toValue = to[valueKey];

      if (valueKey === "transform") {
        animatedStyle["transform"] = [];

        (toValue || []).forEach(transform => {
          Object.keys(transform).forEach(transformKey => {
            const transformFromValue = fromTransform[transformKey];

            const animatedValue = new Animated.Value(transformFromValue);

            const toTranformToValue = transform[transformKey];

            console.log("pushing toParallel ", {
              toValue: toTranformToValue,
              useNativeDriver,
              duration
            });

            toParallel.push(
              Animated.timing(animatedValue, {
                toValue: toTranformToValue,
                useNativeDriver,
                duration
              })
            );

            animatedStyle["transform"].push({
              [transformKey]: animatedValue
            });
          });
        });
      } else {
        //non-transform
        const fromValue = from[valueKey];

        const animatedValue = new Animated.Value(fromValue);

        console.log("pushing toParallel ", {
          toValue,
          useNativeDriver,
          duration
        });
        toParallel.push(
          Animated.timing(animatedValue, {
            toValue,
            useNativeDriver,
            duration
          })
        );

        animatedStyle[valueKey] = animatedValue;
      }
    });

    this.setState(
      {
        animatedStyle
      },
      () => {
        Animated.parallel(toParallel).start(
          () => this.props.onAnimationEnd && this.props.onAnimationEnd()
        );
      }
    );
  }

  render() {
    const { animatedStyle } = this.state;
    const { style } = this.props;

    return (
      <Animated.View style={[style, animatedStyle]}>
        {this.props.children}
      </Animated.View>
    );
  }
}

function animatedPageKey(pathname) {
  //Don't want each new /topics/:topicId path to <animate></animate> in
  if (pathname.slice(0, 7) == "/topics") return "/topics";
  return pathname;
}

const Pages = ({ location }) =>
  <Transitioner
    getAnimationEnter={animationEnterForKey}
    getAnimationLeave={animationLeaveForKey}
    childKey={animatedPageKey(location.pathname)}
  >
    <Switch location={location}>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/topics" component={Topics} />
      <Route component={Home} />
    </Switch>
  </Transitioner>;

class Transitioner extends Component {
 

  state = {
    prevChildKey: null,
    prevChild: null
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.childKey && this.props.childKey !== nextProps.childKey) {
      console.log(
        "will transition from ",
        this.props.childKey,
        " to ",
        nextProps.childKey
      );

      this.setState({
        prevChildKey: this.props.childKey,
        prevChild: React.Children.only(this.props.children)
      });
    }
  }

  onAnimationLeaveEnd = () => {
    //Unmount the previous child once it animates out
    this.setState({
      prevChildKey: null,
      prevChild: null
    });
  };

  render() {
    const {
      childKey,
      children,
      getAnimationEnter,
      getAnimationLeave,
      animationEnter,
      animationLeave,
      animationDurationMs = 400
    } = this.props;

    const { prevChildKey, prevChild } = this.state;

    const aEnter =
      (getAnimationEnter && getAnimationEnter(childKey)) || animationEnter;
    const aLeave =
      (prevChildKey && getAnimationLeave && getAnimationLeave(prevChildKey)) ||
      animationLeave;
    //gets the single child or throws
    const child = React.Children.only(children);

    return (
      <View
        style={{
          flex: 1
        }}
      >

        {/* using react-native-animatable */}
        {prevChildKey &&
          <AnimatedView
            key={prevChildKey}
            easing="ease-in-out"
            useNativeDriver
            style={styles2.absoluteContainer}
            duration={animationDurationMs}
            animation={aLeave}
            onAnimationEnd={this.onAnimationLeaveEnd}
          >
            {prevChild}
          </AnimatedView>}

        {
          <AnimatedView
            key={childKey}
            easing="ease-in-out"
            useNativeDriver
            style={styles2.absoluteContainer}
            duration={animationDurationMs}
            animation={aEnter}
          >
            {child}
          </AnimatedView>
        }

      </View>
    );
  }
}

const styles2 = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});


