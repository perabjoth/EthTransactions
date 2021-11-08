import React from 'react'
import ReactTimeAgo from 'react-time-ago'

export default function LastSeen({ date }) {
  return (
      <ReactTimeAgo date={date} locale="en-US"/>
  )
}