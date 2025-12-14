import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}

export default function AdminIndex() {
  // This page intentionally redirects to `/` via getServerSideProps.
  return null
}
