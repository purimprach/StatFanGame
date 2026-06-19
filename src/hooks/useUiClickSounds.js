import { useEffect } from 'react'
import { playUiClick } from '../lib/gameSounds'

const CLICKABLE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  '[role="button"]:not([aria-disabled="true"])',
  '.category-card',
].join(', ')

function shouldPlayClickSound(target) {
  if (!(target instanceof Element)) {
    return false
  }

  if (target.closest('[data-ui-click="off"]')) {
    return false
  }

  const clickable = target.closest(CLICKABLE_SELECTOR)
  if (!clickable) {
    return false
  }

  if (clickable instanceof HTMLButtonElement && clickable.disabled) {
    return false
  }

  if (clickable.getAttribute('aria-disabled') === 'true') {
    return false
  }

  return true
}

export function useUiClickSounds() {
  useEffect(() => {
    const onPointerDown = (event) => {
      if (event.button !== 0) {
        return
      }

      if (!shouldPlayClickSound(event.target)) {
        return
      }

      playUiClick()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [])
}
