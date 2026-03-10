import { useEffect } from 'react'

function useWindowTitle(title) {
  useEffect(() => {
    document.title = title
  }, [title])
}

export default useWindowTitle
