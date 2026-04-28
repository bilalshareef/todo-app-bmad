import { renderHook, act } from '@testing-library/react'
import { useToast } from './useToast'

describe('useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('starts with no visible toast', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toast).toEqual({
      message: null,
      visible: false,
      exiting: false,
    })
  })

  it('showToast sets message and visible=true', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Something went wrong')
    })

    expect(result.current.toast).toEqual({
      message: 'Something went wrong',
      visible: true,
      exiting: false,
    })
  })

  it('toast auto-dismisses: exiting becomes true after 4 seconds', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Error occurred')
    })

    act(() => {
      jest.advanceTimersByTime(4000)
    })

    expect(result.current.toast).toEqual({
      message: 'Error occurred',
      visible: true,
      exiting: true,
    })
  })

  it('toast fully dismisses after 4s + 300ms', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Error occurred')
    })

    act(() => {
      jest.advanceTimersByTime(4300)
    })

    expect(result.current.toast).toEqual({
      message: null,
      visible: false,
      exiting: false,
    })
  })

  it('calling showToast again while visible replaces message and resets timer', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('First error')
    })

    // Advance 3 seconds (not yet dismissed)
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // Show new toast — should replace
    act(() => {
      result.current.showToast('Second error')
    })

    expect(result.current.toast).toEqual({
      message: 'Second error',
      visible: true,
      exiting: false,
    })

    // After 3 more seconds (6s total), the first timer would have dismissed but the new one hasn't
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(result.current.toast.visible).toBe(true)
    expect(result.current.toast.exiting).toBe(false)

    // After 1 more second (4s from second showToast), exiting should be true
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.toast.exiting).toBe(true)
  })

  it('hideToast clears toast immediately', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Error occurred')
    })

    act(() => {
      result.current.hideToast()
    })

    expect(result.current.toast).toEqual({
      message: null,
      visible: false,
      exiting: false,
    })
  })

  it('hideToast prevents auto-dismiss from running', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Error occurred')
    })

    act(() => {
      result.current.hideToast()
    })

    // Advance past auto-dismiss time — should stay hidden
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(result.current.toast).toEqual({
      message: null,
      visible: false,
      exiting: false,
    })
  })

  it('timer is cleaned up on unmount', () => {
    const { result, unmount } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Error occurred')
    })

    unmount()

    // Should not throw or cause state updates after unmount
    act(() => {
      jest.advanceTimersByTime(5000)
    })
  })

  it('showToast during exit animation cancels exit and shows new message', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('First error')
    })

    // Trigger exit
    act(() => {
      jest.advanceTimersByTime(4000)
    })

    expect(result.current.toast.exiting).toBe(true)

    // Show new toast during exit animation
    act(() => {
      result.current.showToast('New error')
    })

    expect(result.current.toast).toEqual({
      message: 'New error',
      visible: true,
      exiting: false,
    })
  })
})
