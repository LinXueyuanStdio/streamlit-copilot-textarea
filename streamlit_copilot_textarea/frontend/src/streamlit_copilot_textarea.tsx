import {
  StreamlitComponentBase,
  withStreamlitConnection,
  Streamlit,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"
import ResizeObserver from 'resize-observer-polyfill'

interface State {
  /**
   * True if the user-specified state.value has not yet been synced to the WidgetStateManager.
   */
  dirty: boolean
  /**
   * The value specified by the user via the UI. If the user didn't touch this
   * widget's UI, the default value is used.
   */
  text: string
  suggestion: string
  isFocused: boolean
  textAreaIsFocused: boolean
  requestsThisMinute: number
  currentMinute: number
}

class StreamlitCopilotTextArea extends StreamlitComponentBase<State> {
  private userTextarea: HTMLTextAreaElement | null = null;
  private suggestionTextarea: HTMLTextAreaElement | null = null;
  private container: HTMLDivElement | null = null;
  public state: State = {
    dirty: false,
    text: "",
    suggestion: "",
    isFocused: false,
    textAreaIsFocused: false,
    requestsThisMinute: 0,
    currentMinute: Math.floor(Date.now() / 60000)
  }

  private resizeObserver: ResizeObserver = new ResizeObserver(() => {
    this.syncHeights();
  });

  componentDidMount(): void {
    if (this.userTextarea) this.resizeObserver.observe(this.userTextarea);
  }
  componentWillUnmount() {
    if (this.userTextarea) this.resizeObserver.unobserve(this.userTextarea);
  }

  public render = (): ReactNode => {
    const { theme } = this.props
    if (!theme) {
      return <div>Theme is undefined, please check streamlit version.</div>
    }
    const height = this.props.args["height"]
    const font_fam = theme.font;

    const f_focused = '1px solid ' + theme.primaryColor;
    const f_not_focused = '1px solid ' + theme.secondaryBackgroundColor;

    return (
      <div
        tabIndex={0}
        style={
          {
            height: `${height}px`,
            width: 'auto',
            border: this.state.isFocused ? f_focused : f_not_focused,
            borderRadius: '0.5em',
            // paddingBottom: '0.5em',
            // overflowY: 'scroll',
            // overflowX: 'hidden',
            position: 'relative',
            backgroundColor: theme.secondaryBackgroundColor,
            minHeight: "95px",
          }
        }
        onFocus={this._onFocus}
        onBlur={this._onBlur}
        ref={(div) => { this.container = div; }}
      >
        <textarea
          style={
            {
              fontFamily: font_fam,
              color: theme.base === 'light' ? 'rgba(41,51,62,0.5)' : 'rgba(255,255,255,0.5)',
              borderRadius: '0.5em',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              whiteSpace: 'pre-wrap',
              // width: 'calc(100% - 1.2em)',
              width: '100%',
              // width: 'auto',
              height: `${height - 1}px`,
              border: 'none',
              outline: 'none',
              position: 'absolute',
              backgroundColor: 'transparent',
              lineHeight: '1.4em',
              resize: 'none',
              overflow: 'hidden',
              minHeight: "94px",
            }
          }
          value={this.state.suggestion}
          readOnly
          ref={(textarea) => { this.suggestionTextarea = textarea; }}
        />
        <textarea
          style={
            {
              fontFamily: font_fam,
              color: theme.textColor,
              borderRadius: '0.5em',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              whiteSpace: 'pre-wrap',
              // width: 'calc(100% - 1.2em)',
              width: '100%',
              height: `${height - 1}px`,
              lineHeight: '1.4em',
              border: 'none',
              outline: 'none',
              position: 'absolute',
              backgroundColor: 'transparent',
              // padding: '0',
              minHeight: "94px",
              resize: "vertical",
            }
          }
          value={this.state.text}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onBlur={this._onTextAreaBlur}
          onScroll={this.onScroll}
          ref={(textarea) => { this.userTextarea = textarea; }}
        />
      </div>
    )
  }

  public componentDidUpdate(): void {
    if (this.userTextarea && this.suggestionTextarea) {
      this.suggestionTextarea.scrollTop = this.userTextarea.scrollTop;
      this.syncHeights()
    }
  }
  private onScroll = (): void => {
    this.forceUpdate();
  }

  private syncHeights = (): void => {
    if (this.userTextarea && this.suggestionTextarea && this.container) {
      const newHeight = this.userTextarea.scrollHeight;
      const containerHeight = newHeight + 1;

      this.suggestionTextarea.style.height = `${newHeight}px`;
      this.userTextarea.style.height = `${newHeight}px`;
      this.container.style.height = `${containerHeight}px`;
      Streamlit.setFrameHeight(containerHeight);
    }
  };
  private onChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const text = event.target.value
    const api_upl = this.props.args["api_url"]
    this.setState({ text, suggestion: "" }, () => {
      if (text.trim() !== "") {
        this.callApi(text, api_upl).then(suggestion => {
          if (this.state.text.trim() !== "") {
            this.setState({ suggestion: this.state.text + suggestion })
          }
        })
      }
    })
  }


  isEnterKeyPressed = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): boolean => {
    const { keyCode, key } = event

    // Using keyCode as well due to some different behaviors on Windows
    // https://bugs.chromium.org/p/chromium/issues/detail?id=79407
    return (
      (key === "Enter" || keyCode === 13 || keyCode === 10) &&
      // Do not send the sentence being composed when Enter is typed into the IME.
      !(event.nativeEvent?.isComposing === true)
    )
  }

  // private debounce = (callback: Function, wait: number) => {
  //   let timeoutId: number | null = null;
  //   return (...args: any) => {
  //     if (timeoutId) {
  //       window.clearTimeout(timeoutId);
  //     }
  //     timeoutId = window.setTimeout(() => {
  //       callback.apply(null, args);
  //     }, wait);
  //   };
  // }
  private onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const { metaKey, ctrlKey } = event
    const { dirty } = this.state

    if (this.isEnterKeyPressed(event) && (ctrlKey || metaKey) && dirty) {
      event.preventDefault()
      this.setState({ dirty: false }, () => {
        this._onTextAreaBlur()
      })
    } else if (event.key === 'Tab') {
      event.preventDefault()
      this.setState(prevState => ({
        text: prevState.suggestion,
        suggestion: '',
        dirty: true
      }), () => {
        // Create a synthetic event and call onChange manually
        const syntheticEvent = {
          target: { value: this.state.text }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        this.onChange(syntheticEvent);
      })
    }
  }

  private _onTextAreaBlur = (): void => {
    this.setState({ textAreaIsFocused: false }, () => {
      Streamlit.setComponentValue(this.state.text);
      this.setState({ suggestion: '' });
    });
  }

  private _onFocus = (): void => {
    this.setState({ isFocused: true })
  }

  private _onBlur = (): void => {
    this.setState({ isFocused: false })
  }

  private abortController = new AbortController();

  private callApi = async (text: string, api_upl: string): Promise<string> => {
    // Abort the previous request
    this.abortController.abort();
    this.abortController = new AbortController();

    if (text.trim() === "") {
      return "";
    }

    const currentMinute = Math.floor(Date.now() / 60000);
    if (currentMinute > this.state.currentMinute) {
      this.setState({
        currentMinute: currentMinute,
        requestsThisMinute: 0
      });
    } else if (this.state.requestsThisMinute > this.props.args["requests_per_minute"]) {
      // Retry after 1 second if limit is exceeded
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.callApi(text, api_upl));
        }, 1000);
      });
    }

    const { prompt_template, api_url, height, fontFamily, border, ...model_kwargs } = this.props.args;
    const prompt = prompt_template.replace("{input_text}", text); // format the prompt
    const payload = {
      prompt: prompt,
      ...model_kwargs
    };
    const headers = {
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(api_upl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.setState(prevState => ({
        requestsThisMinute: prevState.requestsThisMinute + 1
      }));

      const responseJson = await response.json();
      return responseJson["choices"][0]["text"];
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return "";  // Return empty string if request was aborted
        }
        console.error("Error decoding response", error);
      } else {
        console.error("Unknown error", error);
      }
      return "";
    }
  }
}

export default withStreamlitConnection(StreamlitCopilotTextArea)
