import { ArrowLeft, Check, Lock, LogOut, MapPin, Trash2, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../context/AuthContext";

const sameId = (a, b) => String(a?._id || a) === String(b?._id || b);

export default function CommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [requestBusy, setRequestBusy] = useState("");

  const userId = user?.id || user?._id;
  const isSuperAdmin = user?.role === "super_admin";
  const isMember = useMemo(
    () => Boolean(isSuperAdmin || (userId && community?.members?.some((member) => sameId(member, userId)))),
    [community, isSuperAdmin, userId],
  );
  const isAdmin = Boolean(isSuperAdmin || (userId && sameId(community?.creator, userId)));
  const hasPendingRequest = useMemo(
    () => Boolean(userId && community?.joinRequests?.some((request) => sameId(request.user, userId))),
    [community, isSuperAdmin, userId],
  );

  const loadCommunity = (signal) =>
    api
      .get(`/communities/${id}`, { signal })
      .then((r) => setCommunity(r.data))
      .catch((error) => {
        if (error.name !== "CanceledError") {
          toast.error(error.response?.data?.message || "Could not load community");
        }
      });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    loadCommunity(controller.signal).finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!isMember) {
      setRoom(null);
      return undefined;
    }

    const controller = new AbortController();
    api
      .get(`/chat/communities/${id}/room`, { signal: controller.signal })
      .then((r) => setRoom(r.data))
      .catch((error) => {
        if (error.name !== "CanceledError") {
          setRoom(null);
          toast.error(error.response?.data?.message || "Could not open community chat");
        }
      });
    return () => controller.abort();
  }, [id, isMember]);

  const requestJoin = async () => {
    if (!user) {
      toast.error("Sign in to request community access");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.put(`/communities/${id}/request`);
      setCommunity(data);
      toast.success("Join request sent to the community admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send join request");
    } finally {
      setBusy(false);
    }
  };

  const leaveCommunity = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/communities/${id}/leave`);
      setCommunity(data);
      setRoom(null);
      toast.success("Exited community");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not exit community");
    } finally {
      setBusy(false);
    }
  };

  const deleteCommunity = async () => {
    if (!window.confirm(`Delete ${community.name}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api.delete(`/communities/${id}`);
      toast.success("Community deleted");
      navigate("/communities");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete community");
    } finally {
      setBusy(false);
    }
  };
  const decideRequest = async (requestUserId, decision) => {
    setRequestBusy(`${decision}:${requestUserId}`);
    try {
      const { data } = await api.put(`/communities/${id}/requests/${requestUserId}/${decision}`);
      setCommunity(data);
      toast.success(decision === "approve" ? "Request approved" : "Request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update request");
    } finally {
      setRequestBusy("");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="card p-10 text-center">Loading community...</div>
      </main>
    );
  }

  if (!community) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="card p-10 text-center">Community not found.</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <Link to="/communities" className="mb-6 inline-flex items-center gap-2 font-semibold text-ink/60 hover:text-forest">
        <ArrowLeft size={18} />
        Communities
      </Link>

      <section className="grid gap-7 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-5 self-start">
          <div className="card p-6">
            <Users className="text-coral" size={30} />
            <h1 className="mt-4 text-4xl">{community.name}</h1>
            <p className="mt-3 text-ink/60">{community.description}</p>
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-ink/60">
              <MapPin size={16} />
              {[community.locality, community.city].filter(Boolean).join(", ")}
            </p>
            <p className="mt-3 text-sm text-ink/50">
              {community.members?.length || 0} members
            </p>

            {isMember ? (
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-mint p-4 text-sm font-semibold text-forest">
                  {isSuperAdmin ? "Super admin access is enabled." : isAdmin ? "You manage this community." : "You are a member. Community chat is unlocked."}
                </div>
                {!isAdmin && (
                  <button
                    type="button"
                    onClick={leaveCommunity}
                    disabled={busy}
                    className="btn-soft w-full text-coral"
                  >
                    <LogOut size={17} />
                    {busy ? "Exiting..." : "Exit community"}
                  </button>
                )}
              </div>
            ) : hasPendingRequest ? (
              <div className="mt-6 rounded-2xl bg-mint p-4 text-sm font-semibold text-forest">
                Your request is pending admin approval.
              </div>
            ) : (
              <button
                onClick={requestJoin}
                disabled={busy}
                className="btn-primary mt-6 w-full"
              >
                {busy ? "Sending request..." : "Request to join"}
              </button>
            )}
          </div>

          {isAdmin && (
            <section className="card p-5">
              <h2 className="text-2xl">Join requests</h2>
              <button
                type="button"
                onClick={deleteCommunity}
                disabled={busy}
                className="btn-soft mt-4 w-full text-coral"
              >
                <Trash2 size={17} />
                {busy ? "Deleting..." : "Delete community"}
              </button>
              <div className="mt-4 space-y-3">
                {community.joinRequests?.length ? (
                  community.joinRequests.map((request) => {
                    const requestUser = request.user;
                    const requestUserId = requestUser?._id || requestUser;
                    return (
                      <div key={requestUserId} className="rounded-2xl bg-forest/5 p-4">
                        <p className="font-bold">{requestUser?.name || "Neighbour"}</p>
                        {requestUser?.email && (
                          <p className="text-xs text-ink/45">{requestUser.email}</p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => decideRequest(requestUserId, "approve")}
                            disabled={Boolean(requestBusy)}
                            className="btn-soft flex-1"
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => decideRequest(requestUserId, "reject")}
                            disabled={Boolean(requestBusy)}
                            className="btn-soft flex-1 text-coral"
                          >
                            <X size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-2xl bg-mint p-4 text-sm text-ink/55">
                    No pending requests.
                  </p>
                )}
              </div>
            </section>
          )}
        </aside>

        <section className="card overflow-hidden">
          <div className="border-b border-forest/10 p-5">
            <h2 className="text-2xl">Community chat room</h2>
            <p className="mt-1 text-sm text-ink/50">
              Only approved members of {community.name} can read and send messages here.
            </p>
          </div>

          {isMember ? (
            <ChatBox room={room} description="Members-only community room" />
          ) : (
            <div className="grid h-[32rem] place-items-center p-8 text-center text-ink/55">
              <div>
                <Lock className="mx-auto mb-3 text-coral" />
                <h3 className="text-2xl text-forest">Approval required</h3>
                <p className="mt-2 max-w-sm">
                  Request access and wait for the community admin to approve you.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
