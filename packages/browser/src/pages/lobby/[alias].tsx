import type { VFC } from 'react'

import { useRouter } from 'next/router'

import { Lobby } from 'ui/Lobby'

const LobbyPage: VFC = () => {
  const router = useRouter()
  const alias = router.query.alias as string

  return <Lobby alias={alias} />
}

export default LobbyPage
