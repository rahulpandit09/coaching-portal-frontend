import { NextSeo } from "next-seo"
import Head from "next/head"
import { MetaData, AppConfig } from "@/utils/AppConfig"

interface IMetaProps {
  title?: string
  description?: string
}

const Meta: React.FC<IMetaProps> = ({ title, description }) => {
  const pageTitle = title ? `${title} | ${MetaData.title}` : MetaData.title
  const pageDesc = description || MetaData.description

  return (
    <>
      <Head>
        <link rel="icon" href="/coaching-faveicon-badge.png" />
      </Head>
      <NextSeo
        title={pageTitle}
        description={pageDesc}
        openGraph={{
          title: pageTitle,
          description: pageDesc,
          site_name: AppConfig.siteName,
        }}
      />
    </>
  )
}

export default Meta
