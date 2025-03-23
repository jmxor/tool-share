async function RequestPage({
  params,
}: {
  params: Promise<{ request_id: string }>;
}) {
  const request_id = (await params).request_id;

  return (
    <div>
      <p>{request_id}</p>
    </div>
  );
}
export default RequestPage;
